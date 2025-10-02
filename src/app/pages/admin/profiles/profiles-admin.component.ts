import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProfilesService, Profile } from '../../../services/profiles.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profiles-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './profiles-admin.component.html',
  styleUrls: ['./profiles-admin.component.scss']
})
export class ProfilesAdminComponent implements OnInit {
  profileForm: FormGroup;
  profiles$: Observable<Profile[]>;
  isEditing = false;
  currentProfileId: string | null = null;
  selectedCoverFile: File | null = null;
  selectedSidebarFile: File | null = null;
  isUploading = false;
  coverPreviewUrl: string | null = null;
  sidebarPreviewUrl: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private profilesService: ProfilesService
  ) {
    this.profileForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      weight: ['', [Validators.required, Validators.min(0)]],
      equivalence: ['', [Validators.required, Validators.min(0)]]
    });

    this.profiles$ = this.profilesService.getProfiles();
  }

  ngOnInit(): void { }

  onFileSelected(event: any, type: 'cover' | 'sidebar'): void {
    const file = event.target.files[0];
    if (file) {
      if (type === 'cover') {
        this.selectedCoverFile = file;
      } else {
        this.selectedSidebarFile = file;
      }

      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (type === 'cover') {
          this.coverPreviewUrl = e.target.result;
        } else {
          this.sidebarPreviewUrl = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.profileForm.valid) {
      this.isUploading = true;
      try {
        const profileData: Profile = {
          name: this.profileForm.get('name')?.value,
          description: this.profileForm.get('description')?.value,
          weight: parseFloat(this.profileForm.get('weight')?.value),
          equivalence: parseFloat(this.profileForm.get('equivalence')?.value)
        };

        console.log('Salvando perfil:', profileData);
        console.log('Arquivos selecionados:', {
          cover: this.selectedCoverFile?.name,
          sidebar: this.selectedSidebarFile?.name
        });

        if (this.isEditing && this.currentProfileId) {
          console.log('Atualizando perfil ID:', this.currentProfileId);
          await this.profilesService.updateProfile(
            this.currentProfileId,
            profileData,
            this.selectedCoverFile || undefined,
            this.selectedSidebarFile || undefined
          );
        } else {
          console.log('Criando novo perfil');
          await this.profilesService.addProfile(
            profileData,
            this.selectedCoverFile || undefined,
            this.selectedSidebarFile || undefined
          );
        }

        console.log('Perfil salvo com sucesso');
        this.resetForm();
      } catch (error: any) {
        console.error('Erro detalhado ao salvar perfil:', error);
        
        // Tratamento de erros específicos
        let errorMessage = 'Erro ao salvar perfil.';
        
        if (error.message && error.message.includes('storage/unauthorized')) {
          errorMessage = 'Erro de permissão: Você não tem autorização para acessar ou modificar as imagens no Firebase Storage. Verifique suas permissões.';
        } else if (error.message && error.message.includes('upload')) {
          errorMessage = 'Erro no upload das imagens. Verifique se os arquivos são válidos e tente novamente.';
        } else if (error.message && error.message.includes('banco de dados')) {
          errorMessage = 'Erro ao salvar no banco de dados. Verifique sua conexão e tente novamente.';
        } else if (error.message) {
          errorMessage = `Erro: ${error.message}`;
        }
        
        alert(errorMessage);
      } finally {
        this.isUploading = false;
      }
    }
  }

  editProfile(profile: Profile): void {
    console.log('Editando perfil:', profile);
    console.log('URLs de imagens encontradas:', {
      'images[0]': profile.images?.[0],
      'images[1]': profile.images?.[1], 
      'coverImageUrl': profile.coverImageUrl,
      'sidebarImageUrl': profile.sidebarImageUrl
    });

    this.isEditing = true;
    this.currentProfileId = profile.id || null;
    this.profileForm.patchValue({
      name: profile.name,
      description: profile.description,
      weight: profile.weight,
      equivalence: profile.equivalence
    });
    
    // Usar array de imagens com fallback para propriedades antigas
    const coverUrl = profile.images?.[0] || profile.coverImageUrl || null;
    const sidebarUrl = profile.images?.[1] || profile.sidebarImageUrl || null;
    
    // Verificar se as URLs são válidas (não contêm URLs antigas do WordPress)
    this.coverPreviewUrl = this.isValidImageUrl(coverUrl) ? coverUrl : null;
    this.sidebarPreviewUrl = this.isValidImageUrl(sidebarUrl) ? sidebarUrl : null;
    
    if (coverUrl && !this.isValidImageUrl(coverUrl)) {
      console.warn('URL inválida encontrada para capa:', coverUrl);
    }
    if (sidebarUrl && !this.isValidImageUrl(sidebarUrl)) {
      console.warn('URL inválida encontrada para sidebar:', sidebarUrl);
    }
  }

  private isValidImageUrl(url: string | null): boolean {
    if (!url) return false;
    
    // Rejeitar URLs antigas do WordPress
    if (url.includes('olgacolor.com.br/wp-content/')) {
      return false;
    }
    
    // Aceitar apenas URLs do Firebase Storage
    if (url.includes('firebasestorage.app') || url.includes('googleapis.com')) {
      return true;
    }
    
    return false;
  }

  async deleteProfile(profile: Profile): Promise<void> {
    if (confirm('Tem certeza que deseja excluir este perfil?')) {
      try {
        await this.profilesService.deleteProfile(profile.id!, profile);
      } catch (error) {
        console.error('Erro ao excluir perfil:', error);
      }
    }
  }

  resetForm(): void {
    this.isEditing = false;
    this.currentProfileId = null;
    this.selectedCoverFile = null;
    this.selectedSidebarFile = null;
    this.coverPreviewUrl = null;
    this.sidebarPreviewUrl = null;
    this.profileForm.reset();
  }

  cancelEdit(): void {
    this.resetForm();
  }

  async cleanInvalidUrls(): Promise<void> {
    if (confirm('Tem certeza que deseja limpar todas as URLs inválidas? Esta ação removerá links antigos do WordPress.')) {
      this.isUploading = true;
      try {
        await this.profilesService.cleanInvalidUrls();
        alert('URLs inválidas foram limpas com sucesso!');
        // Recarregar a lista de perfis
        this.profiles$ = this.profilesService.getProfiles();
      } catch (error) {
        console.error('Erro ao limpar URLs:', error);
        alert('Erro ao limpar URLs. Verifique o console.');
      } finally {
        this.isUploading = false;
      }
    }
  }

  async runDiagnostic(): Promise<void> {
    console.log('🔧 Executando diagnóstico do Firebase...');
    await this.profilesService.diagnoseFirebaseConfig();
    alert('Diagnóstico executado! Verifique o console do navegador para os resultados.');
  }
}