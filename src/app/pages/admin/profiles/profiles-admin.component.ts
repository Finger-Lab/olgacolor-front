import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProfilesService, Profile } from '../../../services/profiles.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profiles-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './profiles-admin.component.html',
  styleUrls: ['./profiles-admin.component.scss']
})
export class ProfilesAdminComponent implements OnInit {
  Math = Math; // Para usar Math.min no template
  
  profileForm: FormGroup;
  profiles$: Observable<Profile[]>;
  profilesArray: Profile[] = []; // Array para usar com paginação
  filteredProfilesArray: Profile[] = []; // Array filtrado para exibição
  paginatedProfiles: Profile[] = []; // Array para página atual
  isEditing = false;
  showModal = false; // Controla a exibição do modal
  currentProfileId: string | null = null;
  selectedCoverFile: File | null = null;
  selectedSidebarFile: File | null = null;
  isUploading = false;
  coverPreviewUrl: string | null = null;
  sidebarPreviewUrl: string | null = null;
  categoryOptions: string[] = []; // Apenas as 5 categorias principais
  additionalCategoryOptions: string[] = []; // Outras categorias encontradas nos perfis
  private readonly DEFAULT_CATEGORIES: string[] = [
    'Construção Civil',
    'Vidraçaria',
    'Moveleira',
    'Industriais',
    'Tabelados'
  ];

  // Paginação
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  // Busca
  searchTerm = '';

  constructor(
    private formBuilder: FormBuilder,
    private profilesService: ProfilesService,
    private cdr: ChangeDetectorRef
  ) {
    this.profileForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      weight: ['', [Validators.required, Validators.min(0)]],
      equivalence: ['', [Validators.required, Validators.min(0)]],
      mainCategory: this.formBuilder.control<string>(''), // Categoria principal (uma das 5)
      additionalCategories: this.formBuilder.control<string[]>([]) // Categorias adicionais (múltipla seleção)
    });

    this.profiles$ = this.profilesService.getProfiles();
    this.categoryOptions = [...this.DEFAULT_CATEGORIES];
  }

  ngOnInit(): void {
    this.loadProfiles();
  }

  private loadProfiles(): void {
    this.profiles$.subscribe(profiles => {
      this.profilesArray = profiles;
      this.updateAdditionalCategoryOptions(profiles);
      this.applyFilters();
    });
  }

  private updateAdditionalCategoryOptions(profiles: Profile[]): void {
    const allCategories = new Set<string>();
    
    profiles.forEach(profile => {
      if (profile.categories) {
        const categories = Array.isArray(profile.categories) 
          ? profile.categories 
          : [profile.categories];
        
        categories.forEach(cat => {
          if (cat && typeof cat === 'string') {
            const trimmed = cat.trim();
            // Adicionar apenas categorias que não estão nas principais
            if (trimmed && !this.DEFAULT_CATEGORIES.includes(trimmed)) {
              allCategories.add(trimmed);
            }
          }
        });
      }
    });
    
    this.additionalCategoryOptions = Array.from(allCategories).sort((a, b) => a.localeCompare(b));
  }



  // Métodos de busca e filtros
  onSearchChange(): void {
    this.currentPage = 1; // Reset para primeira página ao buscar
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.profilesArray];

    // Aplicar filtro de busca
    if (this.searchTerm?.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(profile => {
        // Buscar no nome
        const nameMatch = (typeof profile.name === 'string' && profile.name) 
          ? profile.name.toLowerCase().includes(searchLower) 
          : false;
        
        // Buscar na descrição
        const descriptionMatch = (typeof profile.description === 'string' && profile.description)
          ? profile.description.toLowerCase().includes(searchLower)
          : false;
        
        // Buscar nas categorias
        const categoriesMatch = profile.categories?.some(category => {
          if (typeof category === 'string' && category) {
            return category.toLowerCase().includes(searchLower);
          }
          return false;
        }) || false;
        
        return nameMatch || descriptionMatch || categoriesMatch;
      });
    }

    this.filteredProfilesArray = filtered;
    this.totalItems = filtered.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.updatePaginatedProfiles();
  }

  // Métodos de paginação
  updatePaginatedProfiles(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProfiles = this.filteredProfilesArray.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedProfiles();
    }
  }

  getPaginationArray(): number[] {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    // Ajustar o início se estivermos próximos ao final
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.applyFilters();
  }

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
        // Combinar categoria principal com categorias adicionais
        const mainCategory = this.profileForm.get('mainCategory')?.value;
        const additionalCategories = this.profileForm.get('additionalCategories')?.value || [];
        const allCategories: string[] = [];
        
        if (mainCategory && typeof mainCategory === 'string' && mainCategory.trim()) {
          allCategories.push(mainCategory.trim());
        }
        
        if (Array.isArray(additionalCategories)) {
          additionalCategories.forEach(cat => {
            if (cat && typeof cat === 'string') {
              const trimmed = cat.trim();
              if (trimmed && !allCategories.includes(trimmed)) {
                allCategories.push(trimmed);
              }
            }
          });
        }
        
        const profileData: Profile = {
          name: this.profileForm.get('name')?.value,
          description: this.profileForm.get('description')?.value,
          weight: parseFloat(this.profileForm.get('weight')?.value),
          equivalence: parseFloat(this.profileForm.get('equivalence')?.value),
          categories: allCategories
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
        this.closeModal();
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

  openNewProfileModal(): void {
    this.isEditing = false;
    this.currentProfileId = null;
    this.resetForm();
    this.showModal = true;
    // Prevenir scroll do body quando modal estiver aberto
    document.body.style.overflow = 'hidden';
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
    
    // Separar categoria principal das categorias adicionais
    let mainCategory = '';
    const additionalCategories: string[] = [];
    
    if (profile.categories) {
      const categoriesArray = Array.isArray(profile.categories) 
        ? profile.categories 
        : [profile.categories];
      
      categoriesArray.forEach(cat => {
        if (cat && typeof cat === 'string') {
          const trimmed = cat.trim();
          if (trimmed) {
            // Se for uma das categorias principais, usar como categoria principal
            if (this.DEFAULT_CATEGORIES.includes(trimmed) && !mainCategory) {
              mainCategory = trimmed;
            } else if (!this.DEFAULT_CATEGORIES.includes(trimmed)) {
              // Caso contrário, adicionar às categorias adicionais
              additionalCategories.push(trimmed);
            }
          }
        }
      });
    }
    
    this.profileForm.patchValue({
      name: profile.name,
      description: profile.description,
      weight: profile.weight,
      equivalence: profile.equivalence,
      mainCategory: mainCategory,
      additionalCategories: additionalCategories
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

    // Abrir modal
    this.showModal = true;
    // Prevenir scroll do body quando modal estiver aberto
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
    // Restaurar scroll do body
    document.body.style.overflow = 'auto';
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
    this.profileForm.reset({
      name: '',
      description: '',
      weight: '',
      equivalence: '',
      mainCategory: '',
      additionalCategories: []
    });
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