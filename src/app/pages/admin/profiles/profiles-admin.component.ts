import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProfilesService, Profile } from '../../../services/profiles.service';
import { Observable } from 'rxjs';
import { FacadeSystemTypesService } from '../../../services/facade-system-types.service';
import { FacadeSystemType } from '../../../interfaces/facade-system-type.interface';

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
  showEditingHighlight = false; // Para controlar o destaque visual temporário
  currentProfileId: string | null = null;
  selectedCoverFile: File | null = null;
  selectedSidebarFile: File | null = null;
  isUploading = false;
  coverPreviewUrl: string | null = null;
  sidebarPreviewUrl: string | null = null;
  systemTypes: FacadeSystemType[] = [];
  categoryOptions: string[] = [];
  systemTypeOptions: FacadeSystemType[] = [];
  private readonly DEFAULT_CATEGORIES: string[] = [
    'Construção Civil',
    'Vidraçaria',
    'Moveleiros',
    'Industriais',
    'Tabelados'
  ];
  private categoryOptionSet = new Set<string>();
  private categorySystemMap = new Map<string, Set<string>>();

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
    private cdr: ChangeDetectorRef,
    private systemTypesService: FacadeSystemTypesService
  ) {
    this.profileForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      weight: ['', [Validators.required, Validators.min(0)]],
      equivalence: ['', [Validators.required, Validators.min(0)]],
      categories: this.formBuilder.control<string>(''),
      systemTypes: this.formBuilder.control<string[]>([])
    });

    this.profiles$ = this.profilesService.getProfiles();
    this.mergeCategoryOptions(this.DEFAULT_CATEGORIES);
    this.initializeCategorySystemMap();

    this.profileForm.get('categories')?.valueChanges.subscribe(() => {
      this.filterSelectedSystemTypes();
    });
  }

  ngOnInit(): void {
    this.loadProfiles();
    this.loadSystemTypes();
  }

  private loadProfiles(): void {
    this.profiles$.subscribe(profiles => {
      this.profilesArray = profiles;
      this.updateCategoryOptionsFromProfiles(profiles);
      this.rebuildCategorySystemMap();
      this.applyFilters();
    });
  }

  private loadSystemTypes(): void {
    this.systemTypesService.getActiveFacadeSystemTypes().subscribe({
      next: (types) => {
        this.systemTypes = types || [];
        this.systemTypeOptions = (types || []).sort((a, b) => {
          const nameA = (a.displayName || a.name).toLowerCase();
          const nameB = (b.displayName || b.name).toLowerCase();
          return nameA.localeCompare(nameB);
        });
      },
      error: (error) => {
        console.error('Erro ao carregar tipos de sistemas:', error);
      }
    });
  }

  private updateCategoryOptionsFromProfiles(profiles: Profile[]): void {
    const categories = profiles
      .flatMap(profile => {
        if (!profile.categories) return [];
        return Array.isArray(profile.categories) ? profile.categories : [profile.categories];
      })
      .map(category => category?.trim())
      .filter((category): category is string => !!category);

    if (categories.length) {
      this.mergeCategoryOptions(categories);
    }
  }

  private mergeCategoryOptions(categories: string[]): void {
    categories.forEach(category => this.categoryOptionSet.add(category));
    this.updateCategoryOptionsList();
  }

  private updateCategoryOptionsList(): void {
    const additional = Array.from(this.categoryOptionSet)
      .filter(category => !this.DEFAULT_CATEGORIES.includes(category))
      .sort((a, b) => a.localeCompare(b));

    this.categoryOptions = [...this.DEFAULT_CATEGORIES, ...additional];
  }

  // Métodos de busca e filtros
  onSearchChange(): void {
    this.currentPage = 1; // Reset para primeira página ao buscar
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.profilesArray];

    // Aplicar filtro de busca
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(profile =>
        profile.name?.toLowerCase().includes(searchLower) ||
        profile.description?.toLowerCase().includes(searchLower) ||
        profile.categories?.some(category => category.toLowerCase().includes(searchLower)) ||
        profile.systemTypes?.some(system => system.toLowerCase().includes(searchLower))
      );
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
        const profileData: Profile = {
          name: this.profileForm.get('name')?.value,
          description: this.profileForm.get('description')?.value,
          weight: parseFloat(this.profileForm.get('weight')?.value),
          equivalence: parseFloat(this.profileForm.get('equivalence')?.value),
          categories: this.normalizeCategory(this.profileForm.get('categories')?.value),
          systemTypes: this.normalizeList(this.profileForm.get('systemTypes')?.value)
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
      equivalence: profile.equivalence,
      categories: profile.categories?.[0] || '',
      systemTypes: profile.systemTypes || []
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

    // Scroll para o formulário
    setTimeout(() => {
      const formElement = document.getElementById('profile-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Destacar o formulário
        this.showEditingHighlight = true;
        this.cdr.detectChanges();
        
        // Remover o destaque após alguns segundos
        setTimeout(() => {
          this.showEditingHighlight = false;
          this.cdr.detectChanges();
        }, 3000);
      }
    }, 100);
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
      categories: '',
      systemTypes: []
    });
  }

  cancelEdit(): void {
    console.log('📝 Cancelando edição...');
    
    this.resetForm();
    
    // Scroll suave para a lista de perfis
    setTimeout(() => {
      const profilesListElement = document.querySelector('.table-responsive');
      if (profilesListElement) {
        profilesListElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
    
    // Feedback visual através de notificação
    console.log('ℹ️ Edição cancelada');
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

  protected getSystemOptionsForSelectedCategory(): FacadeSystemType[] {
    const selectedCategory = this.profileForm.get('categories')?.value;
    if (!selectedCategory) {
      return this.systemTypeOptions;
    }

    const allowedSystems = this.categorySystemMap.get(selectedCategory);

    if (allowedSystems && allowedSystems.size > 0) {
      const recommended = this.systemTypeOptions.filter(system =>
        allowedSystems.has(system.displayName || system.name)
      );
      const remaining = this.systemTypeOptions.filter(system =>
        !allowedSystems.has(system.displayName || system.name)
      );
      return [...recommended, ...remaining];
    }

    return this.systemTypeOptions;
  }

  private initializeCategorySystemMap(): void {
    this.categorySystemMap.clear();
    this.DEFAULT_CATEGORIES.forEach(category => {
      this.categorySystemMap.set(category, new Set<string>());
    });
  }

  private rebuildCategorySystemMap(): void {
    this.initializeCategorySystemMap();

    this.profilesArray.forEach(profile => {
      const categories = Array.isArray(profile.categories)
        ? profile.categories
        : profile.categories
          ? [profile.categories]
          : [];
      const systems = profile.systemTypes || [];

      categories.forEach(category => {
        if (!category) return;
        if (!this.categorySystemMap.has(category)) {
          this.categorySystemMap.set(category, new Set<string>());
        }

        const systemSet = this.categorySystemMap.get(category)!;
        systems.forEach(system => systemSet.add(system));
      });
    });
  }

  private filterSelectedSystemTypes(): void {
    // Mantém a seleção atual mesmo que o sistema não esteja entre os recomendados.
  }

  private normalizeList(value: string[] | string | null | undefined): string[] {
    if (!value) {
      return [];
    }

    const values = Array.isArray(value) ? value : [value];

    const normalized = values
      .map(item => item?.trim())
      .filter((item): item is string => !!item);

    return Array.from(new Set(normalized));
  }

  private normalizeCategory(value: string | string[] | null | undefined): string[] {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return this.normalizeList(value);
    }

    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
}