import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  collectionData,
  getDoc
} from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from '@angular/fire/storage';
import { Auth, authState } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

export interface Profile {
  id?: string;
  name: string;
  description: string;
  weight: number;
  equivalence: number;
  coverImageUrl?: string;
  sidebarImageUrl?: string;
  images?: string[]; // Array de URLs das imagens
}

@Injectable({
  providedIn: 'root'
})
export class ProfilesService {
  constructor(
    private firestore: Firestore, 
    private storage: Storage,
    private auth: Auth
  ) { }

  async checkStoragePermissions(): Promise<string[]> {
    const allowedPaths: string[] = [];
    
    const testPaths = [
      'profiles1/',  // Primary path matching Firebase rules
      'profiles/',
      'temp-profiles/',
      'uploads/profiles/',
      'public/profiles/',
      'test/',
      'images/',
      'temp/',
      'public/'
    ];
    
    console.log('🔍 Verificando permissões de storage...');
    
    for (const path of testPaths) {
      try {
        const testRef = ref(this.storage, path);
        await listAll(testRef);
        allowedPaths.push(path);
        console.log(`✅ Acesso permitido a: ${path}`);
      } catch (error: any) {
        console.log(`❌ Acesso negado a: ${path} (${error.code})`);
      }
    }
    
    return allowedPaths;
  }

  async diagnoseFirebaseConfig(): Promise<void> {
    console.log('🔧 === DIAGNÓSTICO DO FIREBASE ===');
    
    // Verificar autenticação
    try {
      const currentUser = this.auth.currentUser;
      if (currentUser) {
        console.log('✅ Usuário autenticado:', {
          uid: currentUser.uid,
          email: currentUser.email,
          emailVerified: currentUser.emailVerified
        });
      } else {
        console.log('❌ Usuário não autenticado');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error);
    }
    
    // Verificar storage
    const allowedPaths = await this.checkStoragePermissions();
    console.log(`📁 Caminhos de storage acessíveis: ${allowedPaths.length > 0 ? allowedPaths.join(', ') : 'NENHUM'}`);
    
    // Verificar firestore
    try {
      const profilesRef = collection(this.firestore, 'profiles');
      console.log('✅ Firestore acessível');
    } catch (error) {
      console.error('❌ Erro ao acessar Firestore:', error);
    }
    
    console.log('🔧 === FIM DO DIAGNÓSTICO ===');
  }

  getProfiles(): Observable<Profile[]> {
    const profilesRef = collection(this.firestore, 'profiles');
    return collectionData(profilesRef, { idField: 'id' }) as Observable<Profile[]>;
  }

  async addProfile(
    profile: Profile, 
    coverImageFile?: File, 
    sidebarImageFile?: File
  ): Promise<void> {
    const images: string[] = [];
    
    if (coverImageFile) {
      const coverImageUrl = await this.uploadImage(coverImageFile, 'cover', profile.name);
      profile.coverImageUrl = coverImageUrl;
      images.push(coverImageUrl);
    }
    
    if (sidebarImageFile) {
      const sidebarImageUrl = await this.uploadImage(sidebarImageFile, 'sidebar', profile.name);
      profile.sidebarImageUrl = sidebarImageUrl;
      images.push(sidebarImageUrl);
    }
    
    // Adicionar array de imagens
    profile.images = images;
    
    const profilesRef = collection(this.firestore, 'profiles');
    await addDoc(profilesRef, profile);
  }

  async updateProfile(
    id: string, 
    profile: Profile, 
    coverImageFile?: File,
    sidebarImageFile?: File
  ): Promise<void> {
    console.log(`🔄 Atualizando perfil ${profile.name} (ID: ${id})`);
    
    // Verificar permissões antes de tentar upload
    if (coverImageFile || sidebarImageFile) {
      console.log('🔐 Verificando permissões de storage...');
      const allowedPaths = await this.checkStoragePermissions();
      
      if (allowedPaths.length === 0) {
        throw new Error('❌ ACESSO NEGADO: Nenhuma pasta de upload está acessível. Verifique suas permissões ou entre em contato com o administrador.');
      }
      
      console.log(`✅ Caminhos disponíveis: ${allowedPaths.join(', ')}`);
    }
    
    const oldProfile = await this.getProfile(id);
    const images: string[] = [...(oldProfile?.images || [])];

    // Gerenciar imagem de capa
    if (coverImageFile) {
      try {
        console.log(`📸 Fazendo upload da nova imagem de capa para ${profile.name}`);
        
        // Tentar deletar imagem antiga se existir
        const oldCoverUrl = oldProfile?.images?.[0] || oldProfile?.coverImageUrl;
        if (oldCoverUrl) {
          try {
            await this.deleteImageByUrl(oldCoverUrl);
          } catch (deleteError) {
            console.warn('⚠️ Erro ao deletar imagem antiga de capa (continuando):', deleteError);
            // Não interromper o processo por erro de delete
          }
        }
        
        const coverImageUrl = await this.uploadImage(coverImageFile, 'cover', profile.name);
        profile.coverImageUrl = coverImageUrl;
        images[0] = coverImageUrl; // Primeira posição para capa
        console.log(`✅ Nova imagem de capa salva para ${profile.name}`);
      } catch (error) {
        console.error('❌ Erro ao fazer upload da imagem de capa:', error);
        throw new Error(`Erro ao fazer upload da imagem de capa: ${error}`);
      }
    } else if (oldProfile?.coverImageUrl || oldProfile?.images?.[0]) {
      // Manter imagem existente se não houver nova
      const existingImage = oldProfile.images?.[0] || oldProfile.coverImageUrl;
      if (existingImage) {
        images[0] = existingImage;
        profile.coverImageUrl = existingImage;
      }
    }

    // Gerenciar imagem do sidebar
    if (sidebarImageFile) {
      try {
        console.log(`📸 Fazendo upload da nova imagem de sidebar para ${profile.name}`);
        
        // Tentar deletar imagem antiga se existir
        const oldSidebarUrl = oldProfile?.images?.[1] || oldProfile?.sidebarImageUrl;
        if (oldSidebarUrl) {
          try {
            await this.deleteImageByUrl(oldSidebarUrl);
          } catch (deleteError) {
            console.warn('⚠️ Erro ao deletar imagem antiga de sidebar (continuando):', deleteError);
            // Não interromper o processo por erro de delete
          }
        }
        
        const sidebarImageUrl = await this.uploadImage(sidebarImageFile, 'sidebar', profile.name);
        profile.sidebarImageUrl = sidebarImageUrl;
        images[1] = sidebarImageUrl; // Segunda posição para sidebar
        console.log(`✅ Nova imagem de sidebar salva para ${profile.name}`);
      } catch (error) {
        console.error('❌ Erro ao fazer upload da imagem de sidebar:', error);
        throw new Error(`Erro ao fazer upload da imagem de sidebar: ${error}`);
      }
    } else if (oldProfile?.sidebarImageUrl || oldProfile?.images?.[1]) {
      // Manter imagem existente se não houver nova
      const existingImage = oldProfile.images?.[1] || oldProfile.sidebarImageUrl;
      if (existingImage) {
        images[1] = existingImage;
        profile.sidebarImageUrl = existingImage;
      }
    }

    // Atualizar array de imagens
    profile.images = images.filter(url => url); // Remove valores vazios
    
    try {
      const profileDoc = doc(this.firestore, 'profiles', id);
      await updateDoc(profileDoc, { ...profile });
      console.log(`✅ Perfil ${profile.name} atualizado no Firestore com sucesso`);
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil no Firestore:', error);
      throw new Error(`Erro ao salvar perfil no banco de dados: ${error}`);
    }
  }

  async deleteProfile(id: string, profile: Profile): Promise<void> {
    // Tentar deletar imagens, mas não falhar se houver erro de permissão
    try {
      await this.deleteImage(profile.name, 'cover');
      console.log(`✅ Imagem de capa deletada para ${profile.name}`);
    } catch (error) {
      console.warn(`⚠️ Não foi possível deletar imagem de capa para ${profile.name}:`, error);
    }
    
    try {
      await this.deleteImage(profile.name, 'sidebar');
      console.log(`✅ Imagem de sidebar deletada para ${profile.name}`);
    } catch (error) {
      console.warn(`⚠️ Não foi possível deletar imagem de sidebar para ${profile.name}:`, error);
    }
    
    // Deletar o documento do Firestore (isso sempre deve funcionar)
    const profileDoc = doc(this.firestore, 'profiles', id);
    await deleteDoc(profileDoc);
    console.log(`✅ Perfil ${profile.name} deletado do Firestore`);
  }

  private async uploadImage(file: File, type: 'cover' | 'sidebar', profileName: string): Promise<string> {
    const imageNumber = type === 'cover' ? '_1' : '_2';
    const timestamp = Date.now();
    
    // Obter caminhos permitidos dinamicamente
    const allowedPaths = await this.checkStoragePermissions();
    
    if (allowedPaths.length === 0) {
      throw new Error('❌ Nenhuma pasta de upload disponível. Verifique as permissões do Firebase Storage.');
    }
    
    // Gerar caminhos de upload baseados nos caminhos permitidos
    const uploadPaths = allowedPaths.map(basePath => 
      `${basePath}${profileName}/${profileName}${imageNumber}_${timestamp}.jpg`
    );
    
    // Adicionar caminhos alternativos se necessário
    uploadPaths.push(
      ...allowedPaths.map(basePath => 
        `${basePath}${profileName}${imageNumber}_${timestamp}.jpg`
      )
    );
    
    console.log(`📤 Tentando upload em ${uploadPaths.length} caminhos possíveis...`);
    
    let lastError: any = null;
    
    for (const filePath of uploadPaths) {
      try {
        console.log(`📤 Tentando upload para: ${filePath}`);
        
        const fileRef = ref(this.storage, filePath);
        await uploadBytes(fileRef, file);
        const downloadUrl = await getDownloadURL(fileRef);
        
        console.log(`✅ Upload bem-sucedido em: ${filePath}`);
        console.log(`✅ URL obtida: ${downloadUrl}`);
        return downloadUrl;
        
      } catch (error: any) {
        console.warn(`⚠️ Falhou em ${filePath}:`, error.code || error.message);
        lastError = error;
        
        // Se não for erro de permissão, parar tentativas
        if (error.code !== 'storage/unauthorized') {
          console.warn(`⚠️ Erro não relacionado a permissão, parando tentativas: ${error.code}`);
          break;
        }
      }
    }
    
    // Se chegou aqui, todas as tentativas falharam
    console.error(`❌ Todas as tentativas de upload falharam. Último erro:`, lastError);
    
    if (lastError?.code === 'storage/unauthorized') {
      throw new Error('❌ PERMISSÃO NEGADA: Sua conta não tem autorização para fazer upload de imagens em nenhuma pasta disponível. Entre em contato com o administrador do sistema para ajustar as permissões do Firebase Storage.');
    } else if (lastError?.code === 'storage/invalid-format') {
      throw new Error('❌ FORMATO INVÁLIDO: Use apenas imagens nos formatos JPG, PNG ou WEBP.');
    } else if (lastError?.code === 'storage/quota-exceeded') {
      throw new Error('❌ COTA EXCEDIDA: Espaço de armazenamento esgotado. Entre em contato com o administrador.');
    } else {
      throw new Error(`❌ ERRO DE UPLOAD: ${lastError?.message || 'Erro desconhecido no upload da imagem'}`);
    }
  }

  private async deleteImage(profileName: string, type: 'cover' | 'sidebar'): Promise<void> {
    const imageNumber = type === 'cover' ? '_1' : '_2';
    
    // Tentar diferentes caminhos e extensões
    const possiblePaths = [
      `profiles1/${profileName}/${profileName}${imageNumber}.jpg`,
      `profiles1/${profileName}/${profileName}${imageNumber}.png`,
      `profiles1/${profileName}${imageNumber}.jpg`,
      `profiles1/${profileName}${imageNumber}.png`
    ];
    
    for (const filePath of possiblePaths) {
      try {
        const fileRef = ref(this.storage, filePath);
        await deleteObject(fileRef);
        console.log(`✅ Imagem deletada: ${filePath}`);
        return; // Sucesso, sair do loop
      } catch (error: any) {
        if (error.code === 'storage/object-not-found') {
          console.log(`ℹ️ Arquivo não encontrado: ${filePath}`);
        } else if (error.code === 'storage/unauthorized') {
          console.warn(`⚠️ Sem permissão para deletar: ${filePath}`);
        } else {
          console.warn(`⚠️ Erro ao tentar deletar ${filePath}:`, error);
        }
      }
    }
    
    console.log(`⚠️ Não foi possível deletar nenhuma imagem para ${profileName} (${type})`);
  }

  private async deleteImageByUrl(imageUrl: string): Promise<void> {
    if (!imageUrl) return;
    
    try {
      // Extrair o caminho do arquivo da URL do Firebase Storage
      const urlObj = new URL(imageUrl);
      const pathMatch = urlObj.pathname.match(/\/o\/(.+?)\?/);
      
      if (!pathMatch) {
        throw new Error('Não foi possível extrair o caminho da URL');
      }
      
      const filePath = decodeURIComponent(pathMatch[1]);
      console.log(`🗑️ Tentando deletar imagem: ${filePath}`);
      
      const fileRef = ref(this.storage, filePath);
      await deleteObject(fileRef);
      console.log(`✅ Imagem deletada com sucesso: ${filePath}`);
      
    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        console.log(`ℹ️ Arquivo já foi removido ou não existe: ${imageUrl}`);
      } else if (error.code === 'storage/unauthorized') {
        console.warn(`⚠️ Sem permissão para deletar arquivo: ${imageUrl}`);
        throw new Error('Você não tem permissão para deletar esta imagem. Verifique as permissões do Firebase Storage.');
      } else {
        console.error(`❌ Erro ao deletar imagem:`, error);
        throw error;
      }
    }
  }

  private async getProfile(id: string): Promise<Profile | null> {
    const docSnap = await getDoc(doc(this.firestore, 'profiles', id));
    if (!docSnap.exists()) return null;

    const profileData = docSnap.data() as Profile;
    // Se o documento existe, tenta buscar as URLs das imagens
    try {
      const safeName = profileData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      // Tenta obter a URL da imagem de capa (_1)
      try {
        const coverRef = ref(this.storage, `profiles1/${safeName}/_1.jpg`);
        profileData.coverImageUrl = await getDownloadURL(coverRef);
      } catch {
        // Se não encontrar, tenta com outras extensões
        for (const ext of ['jpeg', 'png', 'webp']) {
          try {
            const coverRef = ref(this.storage, `profiles1/${safeName}/_1.${ext}`);
            profileData.coverImageUrl = await getDownloadURL(coverRef);
            break;
          } catch {
            continue;
          }
        }
      }

      // Tenta obter a URL da imagem do sidebar (_2)
      try {
        const sidebarRef = ref(this.storage, `profiles1/${safeName}/_2.jpg`);
        profileData.sidebarImageUrl = await getDownloadURL(sidebarRef);
      } catch {
        // Se não encontrar, tenta com outras extensões
        for (const ext of ['jpeg', 'png', 'webp']) {
          try {
            const sidebarRef = ref(this.storage, `profiles1/${safeName}/_2.${ext}`);
            profileData.sidebarImageUrl = await getDownloadURL(sidebarRef);
            break;
          } catch {
            continue;
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
    }

    return profileData;
  }

  // Método para limpar URLs inválidas (URLs antigas do WordPress)
  async cleanInvalidUrls(): Promise<void> {
    console.log('Iniciando limpeza de URLs inválidas...');
    const profiles = await this.getProfiles().pipe(take(1)).toPromise();
    
    if (!profiles) return;

    for (const profile of profiles) {
      let needsUpdate = false;
      const updatedProfile = { ...profile };

      // Verificar e limpar coverImageUrl
      if (profile.coverImageUrl && profile.coverImageUrl.includes('olgacolor.com.br/wp-content/')) {
        console.log(`Removendo URL inválida de capa para ${profile.name}:`, profile.coverImageUrl);
        updatedProfile.coverImageUrl = undefined;
        needsUpdate = true;
      }

      // Verificar e limpar sidebarImageUrl  
      if (profile.sidebarImageUrl && profile.sidebarImageUrl.includes('olgacolor.com.br/wp-content/')) {
        console.log(`Removendo URL inválida de sidebar para ${profile.name}:`, profile.sidebarImageUrl);
        updatedProfile.sidebarImageUrl = undefined;
        needsUpdate = true;
      }

      // Verificar e limpar array images
      if (profile.images && profile.images.length > 0) {
        const validImages = profile.images.filter(url => 
          url && !url.includes('olgacolor.com.br/wp-content/')
        );
        
        if (validImages.length !== profile.images.length) {
          console.log(`Limpando array de imagens para ${profile.name}`);
          updatedProfile.images = validImages;
          needsUpdate = true;
        }
      }

      // Atualizar o perfil se necessário
      if (needsUpdate && profile.id) {
        try {
          const profileDoc = doc(this.firestore, 'profiles', profile.id);
          await updateDoc(profileDoc, updatedProfile);
          console.log(`URLs limpas para ${profile.name}`);
        } catch (error) {
          console.error(`Erro ao atualizar ${profile.name}:`, error);
        }
      }
    }
    
    console.log('Limpeza de URLs concluída');
  }
}