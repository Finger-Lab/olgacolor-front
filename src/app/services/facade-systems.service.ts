import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, limit } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface FacadeSystem {
  id?: string;
  title: string;
  location: string;
  system: string[];  // Mudou para array de strings
  construtora: string;
  imageUrl?: string;
}

import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class FacadeSystemsService {
  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private auth: Auth
  ) {}



  async uploadImage(file: File): Promise<string> {
    // Verificar se o usuário está autenticado
    if (!this.auth.currentUser) {
      throw new Error('Usuário não autenticado. Faça login para fazer upload de imagens.');
    }

    try {
      // Usar o UID do usuário para organizar os uploads
      const fileName = `${new Date().getTime()}_${file.name}`;
      const storageRef = ref(this.storage, `obras/${fileName}`);
      
      console.log('🔄 Fazendo upload da imagem:', fileName);
      console.log('👤 Usuário autenticado:', this.auth.currentUser.email);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('✅ Upload concluído:', downloadURL);
      return downloadURL;
    } catch (error: any) {
      console.error('❌ Erro no upload:', error);
      
      if (error.code === 'storage/unauthorized') {
        throw new Error('Erro de permissão: Você não tem autorização para fazer upload de imagens. Verifique se está logado como administrador.');
      } else if (error.code === 'storage/unknown') {
        throw new Error('Erro desconhecido no Firebase Storage. Tente novamente em alguns minutos.');
      } else {
        throw new Error(`Erro no upload: ${error.message || 'Erro desconhecido'}`);
      }
    }
  }

  getFacadeSystems(): Observable<FacadeSystem[]> {
    const facadesRef = collection(this.firestore, 'facadeSystems');
    
    return collectionData(facadesRef, { idField: 'id' }).pipe(
      map((data: any[]) => {
        console.log('� Carregando', data?.length, 'obras do Firestore');
        
        // Mapear dados do Firestore para a interface esperada
        const mappedData = data.map((item: any, index: number) => {
          // Primeiro verificar se já existe um campo de localização direto
          const directLocation = item.location || item.estado || item.uf || item.local || item.cidade;
          const location = directLocation || this.extractLocation(item.categorias);
          
          // SISTEMAS: Verificar se já existe um array de sistemas direto no Firestore
          let systemsArray: string[] = [];
          
          if (item.system && Array.isArray(item.system)) {
            // Se já é um array, usar diretamente (filtrar valores inválidos e duplicatas)
            const validSystems = item.system.filter((s: string) => 
              s && s !== 'Sistema não definido' && s.trim() !== ''
            ).map((s: string) => {
              // Normalizar nomes de sistemas para maiúscula (especialmente Aglo)
              if (s.startsWith('Aglo ')) {
                return s.replace('Aglo ', 'AGLO ');
              }
              return s;
            });
            // Remover duplicatas usando Set
            systemsArray = Array.from(new Set(validSystems));
            // console.log(`🔧 Sistema ID ${item.id}: array original:`, item.system, '-> único:', systemsArray);
            if (item.system.length !== systemsArray.length) {
              console.log(`♾️ Removidas ${item.system.length - systemsArray.length} duplicata(s)`);
            }
          } else {
            // Se não é array, usar método de extração
            const directSystem = item.sistema || item.produto;
            systemsArray = this.extractSystemsArray(item.categorias, directSystem);
            // console.log(`🔧 Sistema ID ${item.id}: extraindo de categorias:`, systemsArray);
          }
          
          // Verificar se já existe um campo de construtora direto
          const directConstructor = item.construtora || item.cliente || '';
          const constructor = typeof directConstructor === 'string' ? directConstructor : 'Construtora não definida';
          
          // console.log(`🏗️ [Debug] ID ${item.id}: construtora original:`, item.construtora, '-> processada:', constructor);
          
          const mapped = {
            id: item.id || item.slug || '',
            title: String(item.titulo || item.title || 'Título não definido'),
            location: String(location || 'Localização não definida'),
            system: systemsArray,
            construtora: String(constructor),
            imageUrl: String(item.imagem || item.imageUrl || '')
          };

          return mapped;
        });

        console.log('✅ Processamento concluído:', mappedData?.length, 'obras');
        return mappedData;
      })
    );
  }

  async getFacadeSystemById(id: string): Promise<FacadeSystem | null> {
    try {
      console.log('🔍 Buscando obra com ID:', id);
      
      // Primeiro tenta buscar diretamente por ID
      const docRef = doc(this.firestore, 'facadeSystems', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        console.log('🗃️ Dados brutos do Firestore:', data);
        console.log('🖼️ Campos de imagem disponíveis - imageUrl:', data.imageUrl, '| imagem:', data.imagem);
        
        const facadeSystem: FacadeSystem = {
          id: docSnap.id,
          title: data.title || data.titulo || 'Título não definido',
          location: data.location || data.estado || data.uf || 'Localização não definida',
          system: Array.isArray(data.system) ? data.system : (data.system ? [data.system] : ['Sistema não definido']),
          construtora: data.construtora || data.cliente || 'Construtora não definida',
          imageUrl: data.imageUrl || data.imagem || ''
        };
        
        console.log('✅ Obra encontrada via getDoc:', facadeSystem);
        return facadeSystem;
      }
      
      // Se não encontrar, tenta buscar na lista completa (fallback)
      console.log('⚠️ Documento não encontrado com getDoc, tentando buscar na lista...');
      return new Promise((resolve) => {
        this.getFacadeSystems().subscribe({
          next: (systems) => {
            const foundSystem = systems.find(system => system.id === id);
            if (foundSystem) {
              console.log('✅ Obra encontrada na lista:', foundSystem);
              resolve(foundSystem);
            } else {
              console.log('❌ Obra não encontrada em lugar nenhum com ID:', id);
              resolve(null);
            }
          },
          error: (error) => {
            console.error('❌ Erro ao buscar na lista:', error);
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('❌ Erro ao buscar obra:', error);
      return null;
    }
  }

  // Método auxiliar para extrair localização das categorias
  private extractLocation(categorias: string[]): string {
    if (!categorias || !Array.isArray(categorias)) return 'Localização não definida';
    
    // Procurar por estados brasileiros nas categorias
    const estados = [
      'São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Rio Grande do Sul', 'Paraná', 
      'Santa Catarina', 'Bahia', 'Goiás', 'Espírito Santo', 'Distrito Federal',
      'Pernambuco', 'Ceará', 'Pará', 'Mato Grosso', 'Mato Grosso do Sul',
      'Paraíba', 'Rio Grande do Norte', 'Alagoas', 'Piauí', 'Tocantins',
      'Acre', 'Rondônia', 'Roraima', 'Amapá', 'Amazonas', 'Sergipe', 'Maranhão',
      'SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO', 'ES', 'DF', 
      'PE', 'CE', 'PA', 'MT', 'MS', 'PB', 'RN', 'AL', 'PI', 'TO', 
      'AC', 'RO', 'RR', 'AP', 'AM', 'SE', 'MA'
    ];
    
    // Primeiro, procurar por nomes completos de estados
    for (const categoria of categorias) {
      const categoriaUpper = categoria.toUpperCase();
      
      // Procurar por nomes completos primeiro
      if (categoriaUpper.includes('SÃO PAULO') || categoriaUpper.includes('SAO PAULO')) return 'São Paulo';
      if (categoriaUpper.includes('RIO DE JANEIRO')) return 'Rio de Janeiro';
      if (categoriaUpper.includes('MINAS GERAIS')) return 'Minas Gerais';
      if (categoriaUpper.includes('RIO GRANDE DO SUL')) return 'Rio Grande do Sul';
      if (categoriaUpper.includes('PARANÁ') || categoriaUpper.includes('PARANA')) return 'Paraná';
      if (categoriaUpper.includes('SANTA CATARINA')) return 'Santa Catarina';
      if (categoriaUpper.includes('BAHIA')) return 'Bahia';
      if (categoriaUpper.includes('GOIÁS') || categoriaUpper.includes('GOIAS')) return 'Goiás';
      if (categoriaUpper.includes('ESPÍRITO SANTO') || categoriaUpper.includes('ESPIRITO SANTO')) return 'Espírito Santo';
      if (categoriaUpper.includes('DISTRITO FEDERAL')) return 'Distrito Federal';
      if (categoriaUpper.includes('PERNAMBUCO')) return 'Pernambuco';
      if (categoriaUpper.includes('CEARÁ') || categoriaUpper.includes('CEARA')) return 'Ceará';
      if (categoriaUpper.includes('PARÁ') || categoriaUpper.includes('PARA')) return 'Pará';
      if (categoriaUpper.includes('MATO GROSSO DO SUL')) return 'Mato Grosso do Sul';
      if (categoriaUpper.includes('MATO GROSSO')) return 'Mato Grosso';
      if (categoriaUpper.includes('PARAÍBA') || categoriaUpper.includes('PARAIBA')) return 'Paraíba';
      if (categoriaUpper.includes('RIO GRANDE DO NORTE')) return 'Rio Grande do Norte';
      if (categoriaUpper.includes('ALAGOAS')) return 'Alagoas';
      if (categoriaUpper.includes('PIAUÍ') || categoriaUpper.includes('PIAUI')) return 'Piauí';
      if (categoriaUpper.includes('TOCANTINS')) return 'Tocantins';
      if (categoriaUpper.includes('ACRE')) return 'Acre';
      if (categoriaUpper.includes('RONDÔNIA') || categoriaUpper.includes('RONDONIA')) return 'Rondônia';
      if (categoriaUpper.includes('RORAIMA')) return 'Roraima';
      if (categoriaUpper.includes('AMAPÁ') || categoriaUpper.includes('AMAPA')) return 'Amapá';
      if (categoriaUpper.includes('AMAZONAS')) return 'Amazonas';
      if (categoriaUpper.includes('SERGIPE')) return 'Sergipe';
      if (categoriaUpper.includes('MARANHÃO') || categoriaUpper.includes('MARANHAO')) return 'Maranhão';
    }
    
    // Depois, procurar por siglas (apenas se estiverem isoladas ou no contexto correto)
    for (const categoria of categorias) {
      const categoriaUpper = categoria.toUpperCase();
      
      // Verificar se a sigla está isolada (começo/fim da string ou rodeada por espaços/pontuação)
      const siglasEstados = {
        'SP': 'São Paulo', 'RJ': 'Rio de Janeiro', 'MG': 'Minas Gerais', 
        'RS': 'Rio Grande do Sul', 'PR': 'Paraná', 'SC': 'Santa Catarina',
        'BA': 'Bahia', 'GO': 'Goiás', 'ES': 'Espírito Santo', 'DF': 'Distrito Federal',
        'PE': 'Pernambuco', 'CE': 'Ceará', 'PA': 'Pará', 'MT': 'Mato Grosso',
        'MS': 'Mato Grosso do Sul', 'PB': 'Paraíba', 'RN': 'Rio Grande do Norte',
        'AL': 'Alagoas', 'PI': 'Piauí', 'TO': 'Tocantins', 'AC': 'Acre',
        'RO': 'Rondônia', 'RR': 'Roraima', 'AP': 'Amapá', 'AM': 'Amazonas',
        'SE': 'Sergipe', 'MA': 'Maranhão'
      };
      
      for (const [sigla, nomeCompleto] of Object.entries(siglasEstados)) {
        // Verificar se a sigla aparece isolada (não como parte de outra palavra)
        const regex = new RegExp(`\\b${sigla}\\b`, 'i');
        if (regex.test(categoria)) {
          return nomeCompleto;
        }
      }
    }

    return 'Localização não definida';
  }

  // Método auxiliar para extrair array de sistemas das categorias  
  private extractSystemsArray(categorias: string[], directSystem?: any): string[] {
    const sistemas: string[] = [];
    
    // Se há sistema direto, adicionar ao array
    if (directSystem && typeof directSystem === 'string' && directSystem !== 'Sistema não definido') {
      sistemas.push(directSystem);
    }
    
    // Extrair sistemas das categorias
    if (categorias && Array.isArray(categorias)) {
      for (const categoria of categorias) {
        const sistemaEncontrado = this.extractSystemFromCategory(categoria);
        if (sistemaEncontrado && !sistemas.includes(sistemaEncontrado)) {
          sistemas.push(sistemaEncontrado);
        }
      }
    }
    
    // Retornar array filtrado e sem duplicatas
    const validSystems = sistemas.filter(s => s !== 'Sistema não definido');
    return Array.from(new Set(validSystems)); // Remove duplicatas usando Set
  }

  // Método auxiliar para extrair sistema de uma categoria específica
  private extractSystemFromCategory(categoria: string): string | null {
    if (!categoria) return null;
    
    if (categoria.includes('AGLO')) {
      const match = categoria.match(/AGLO\s*(\d+\.?\d*)/i);
      return match ? `AGLO ${match[1]}` : 'AGLO';
    }
    if (categoria.includes('UniK')) return 'UniK';
    if (categoria.includes('Lock')) {
      // Extrair variação específica do Lock
      if (categoria.includes('Lock/s')) return 'Lock/s';
      if (categoria.includes('Lock/sl')) return 'Lock/sl';
      if (categoria.includes('Lock/HD')) return 'Lock/HD';
      if (categoria.includes('Lock/CL')) return 'Lock/CL';
      if (categoria.includes('Lock/L')) return 'Lock/L';
      return 'Lock';
    }
    if (categoria.includes('Grid')) return 'Grid';
    if (categoria.includes('Colato')) return 'Colato';
    if (categoria.includes('Neograd')) return 'Neograd';
    if (categoria.includes('Delicato')) return 'Delicato';
    if (categoria.includes('Stick')) return 'Stick';
    if (categoria.includes('LineaGlass')) return 'LineaGlass';
    if (categoria.includes('Sierra')) return 'Olga Sierra';
    
    return null;
  }

  // Método auxiliar para extrair sistema das categorias (mantido para compatibilidade)
  private extractSystem(categorias: string[]): string {
    const sistemas = this.extractSystemsArray(categorias);
    return sistemas.length > 0 ? sistemas[0] : 'Sistema não definido';
  }

  // Método para normalizar arrays de sistemas removendo duplicatas
  private normalizeSystemsArray(systems: string[]): string[] {
    if (!Array.isArray(systems)) return [];
    
    // Filtrar valores válidos e remover duplicatas
    const validSystems = systems.filter(s => 
      s && typeof s === 'string' && s !== 'Sistema não definido' && s.trim() !== ''
    );
    
    return Array.from(new Set(validSystems)); // Remove duplicatas
  }

  async createFacadeSystem(facade: Omit<FacadeSystem, 'id'>): Promise<void> {
    console.log('🏪 [FacadeSystemsService] Criando obra no Firestore:', facade);
    console.log('🏗️ [FacadeSystemsService] Construtora recebida:', facade.construtora);
    
    // Normalizar sistemas antes de criar
    const normalizedFacade = {
      ...facade,
      system: this.normalizeSystemsArray(facade.system)
    };
    
    console.log('✨ [FacadeSystemsService] Dados normalizados:', normalizedFacade);
    
    const facadesRef = collection(this.firestore, 'facadeSystems');
    await addDoc(facadesRef, normalizedFacade);
    
    console.log('✅ [FacadeSystemsService] Obra criada com sucesso no Firestore');
  }

  async updateFacadeSystem(id: string, facade: Partial<FacadeSystem>): Promise<void> {
    console.log('🔄 [FacadeSystemsService] Atualizando obra no Firestore:', id, facade);
    console.log('🏗️ [FacadeSystemsService] Construtora recebida:', facade.construtora);
    
    // Normalizar sistemas antes de atualizar (se houver systems no update)
    const normalizedFacade = { ...facade };
    if (facade.system) {
      normalizedFacade.system = this.normalizeSystemsArray(facade.system);
    }
    
    console.log('✨ [FacadeSystemsService] Dados normalizados para update:', normalizedFacade);
    
    const facadeDocRef = doc(this.firestore, 'facadeSystems', id);
    await updateDoc(facadeDocRef, normalizedFacade);
    
    console.log('✅ [FacadeSystemsService] Obra atualizada com sucesso no Firestore');
  }

  async deleteFacadeSystem(id: string): Promise<void> {
    const facadeDocRef = doc(this.firestore, 'facadeSystems', id);
    await deleteDoc(facadeDocRef);
  }

  // Método para limpar dados antigos que possam ter "Sistema não definido"
  async cleanInvalidSystems(): Promise<void> {
    try {
      const facadesRef = collection(this.firestore, 'facadeSystems');
      const snapshot = await getDocs(facadesRef);
      
      const batch: Promise<void>[] = [];
      
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        let needsUpdate = false;
        const cleanedData: any = { ...data };
        
        // Limpar array de sistemas se houver "Sistema não definido" ou duplicatas
        if (data['system'] && Array.isArray(data['system'])) {
          const validSystems = data['system'].filter((s: string) => 
            s && s !== 'Sistema não definido' && s.trim() !== ''
          );
          // Remover duplicatas
          const uniqueSystems = Array.from(new Set(validSystems));
          
          if (uniqueSystems.length !== data['system'].length) {
            cleanedData['system'] = uniqueSystems;
            needsUpdate = true;
          }
        }
        
        // Se há sistema como string única e é inválida
        if (typeof data['system'] === 'string' && 
            (data['system'] === 'Sistema não definido' || data['system'].trim() === '')) {
          cleanedData['system'] = [];
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          const docRef = doc(this.firestore, 'facadeSystems', docSnapshot.id);
          batch.push(updateDoc(docRef, cleanedData));
        }
      });
      
      await Promise.all(batch);
      console.log('Limpeza de sistemas inválidos concluída');
    } catch (error) {
      console.error('Erro na limpeza de sistemas inválidos:', error);
    }
  }
}