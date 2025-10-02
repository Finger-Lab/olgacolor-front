import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FacadeSystemsService, FacadeSystem } from '../../../services/facade-systems.service';
import { NotificationService } from '../../../services/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-obras-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './obras-admin.component.html',
  styleUrl: './obras-admin.component.scss'
})
export class ObrasAdminComponent implements OnInit {
  obraForm: FormGroup;
  obras$: Observable<FacadeSystem[]>;
  obrasArray: FacadeSystem[] = []; // Array para usar com @for
  filteredObrasArray: FacadeSystem[] = []; // Array filtrado para exibição
  isEditing = false;
  currentObraId: string | null = null;
  selectedFile: File | null = null;
  isUploading = false;
  isSubmitting = false;
  previewUrl: string | null = null;
  currentImageUrl: string | null = null; // Para mostrar imagem atual durante edição

  // Filtros
  searchTerm = '';
  selectedEstado = '';
  selectedSistema = '';

  // Listas únicas para os filtros
  estadosUnicos: string[] = [];
  sistemasUnicos: string[] = [];

  // Array para armazenar sistemas selecionados no formulário
  selectedSystems: string[] = [];

  // Lista de sistemas disponíveis
  readonly systemsList = [
    'AGLO 2.0',
    'AGLO 2.5',
    'AGLO 3.2',
    'Colato',
    'Lock/s',
    'Lock/sl',
    'Lock/HD',
    'Lock/CL',
    'Lock/L',
    'Grid',
    'UniK',
    'Neograd',
    'Delicato',
    'Stick',
    'LineaGlass',
    'Olga Sierra'
  ];

  readonly statesList = [
    { uf: 'AC', name: 'Acre' },
    { uf: 'AL', name: 'Alagoas' },
    { uf: 'AP', name: 'Amapá' },
    { uf: 'AM', name: 'Amazonas' },
    { uf: 'BA', name: 'Bahia' },
    { uf: 'CE', name: 'Ceará' },
    { uf: 'DF', name: 'Distrito Federal' },
    { uf: 'ES', name: 'Espírito Santo' },
    { uf: 'GO', name: 'Goiás' },
    { uf: 'MA', name: 'Maranhão' },
    { uf: 'MT', name: 'Mato Grosso' },
    { uf: 'MS', name: 'Mato Grosso do Sul' },
    { uf: 'MG', name: 'Minas Gerais' },
    { uf: 'PA', name: 'Pará' },
    { uf: 'PB', name: 'Paraíba' },
    { uf: 'PR', name: 'Paraná' },
    { uf: 'PE', name: 'Pernambuco' },
    { uf: 'PI', name: 'Piauí' },
    { uf: 'RJ', name: 'Rio de Janeiro' },
    { uf: 'RN', name: 'Rio Grande do Norte' },
    { uf: 'RS', name: 'Rio Grande do Sul' },
    { uf: 'RO', name: 'Rondônia' },
    { uf: 'RR', name: 'Roraima' },
    { uf: 'SC', name: 'Santa Catarina' },
    { uf: 'SP', name: 'São Paulo' },
    { uf: 'SE', name: 'Sergipe' },
    { uf: 'TO', name: 'Tocantins' }
  ];

  constructor(
    private fb: FormBuilder,
    private facadeSystemsService: FacadeSystemsService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.obraForm = this.fb.group({
      title: ['', Validators.required],
      location: ['', Validators.required],
      construtora: ['', Validators.required]
    });

    this.obras$ = this.facadeSystemsService.getFacadeSystems();
  }

  ngOnInit() {
    this.obras$.subscribe({
      next: (obras) => {
        console.log('✅ Obras carregadas:', obras?.length);
        this.obrasArray = obras || [];
        this.updateFilterLists();
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Erro ao carregar obras:', error);
      }
    });
  }

  // Atualizar listas de filtros únicos
  updateFilterLists() {
    const estadosSet = new Set(this.obrasArray.map(obra => obra.location).filter(Boolean));
    
    // Para sistemas, criar um set com todos os sistemas únicos de todos os arrays
    const sistemasSet = new Set<string>();
    this.obrasArray.forEach(obra => {
      if (obra.system && Array.isArray(obra.system)) {
        obra.system.forEach(sistema => {
          // Filtrar valores inválidos
          if (sistema && sistema !== 'Sistema não definido' && sistema.trim() !== '') {
            sistemasSet.add(sistema);
          }
        });
      }
    });
    
    this.estadosUnicos = Array.from(estadosSet).sort();
    this.sistemasUnicos = Array.from(sistemasSet).sort();
  }

  // Aplicar filtros
  applyFilters() {
    this.filteredObrasArray = this.obrasArray.filter(obra => {
      const matchesSearch = this.matchesSearchTerm(obra);
      const matchesEstado = !this.selectedEstado || obra.location === this.selectedEstado;
      const matchesSistema = !this.selectedSistema || (
        obra.system && 
        Array.isArray(obra.system) && 
        obra.system.includes(this.selectedSistema)
      );
      
      return matchesSearch && matchesEstado && matchesSistema;
    });
  }

  // Verificar se obra atende ao termo de busca
  private matchesSearchTerm(obra: FacadeSystem): boolean {
    if (!this.searchTerm) return true;
    
    const searchLower = this.searchTerm.toLowerCase();
    
    // Verificar título
    const title = obra.title || '';
    if (typeof title === 'string' && title.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Verificar sistemas (array)
    if (obra.system && Array.isArray(obra.system)) {
      for (const sistema of obra.system) {
        if (typeof sistema === 'string' && sistema.toLowerCase().includes(searchLower)) {
          return true;
        }
      }
    }
    
    // Verificar construtora
    const construtora = obra.construtora || '';
    if (typeof construtora === 'string' && construtora.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    return false;
  }

  // Métodos para mudança de filtros
  onSearchChange() {
    this.applyFilters();
  }

  onEstadoChange() {
    this.applyFilters();
  }

  onSistemaChange() {
    this.applyFilters();
  }

  // Limpar filtros
  clearFilters() {
    this.searchTerm = '';
    this.selectedEstado = '';
    this.selectedSistema = '';
    this.applyFilters();
  }

  // Métodos para gerenciar sistemas selecionados no formulário
  isSystemSelected(system: string): boolean {
    return this.selectedSystems.includes(system);
  }

  onSystemChange(system: string, event: any) {
    console.log('Sistema alterado:', system, 'Checked:', event.target.checked);
    console.log('Sistemas antes da alteração:', [...this.selectedSystems]);
    
    if (event.target.checked) {
      if (!this.selectedSystems.includes(system)) {
        this.selectedSystems.push(system);
      }
    } else {
      const index = this.selectedSystems.indexOf(system);
      if (index > -1) {
        this.selectedSystems.splice(index, 1);
      }
    }
    
    console.log('Sistemas após alteração:', [...this.selectedSystems]);
    
    // Forçar detecção de mudanças
    this.cdr.detectChanges();
  }

  // Função auxiliar para remover campos undefined antes de enviar ao Firestore
  private cleanObjectForFirestore(obj: any): any {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  // Funções de tracking para otimizar performance do @for
  trackBySystem(index: number, system: string): string {
    return system;
  }

  trackBySelectedSystem(index: number, system: string): string {
    return `selected-${system}`;
  }

  trackByObraSystem(index: number, sistema: string): string {
    return `obra-${sistema}`;
  }

  trackByEstado(index: number, estado: string): string {
    return estado;
  }

  trackBySistema(index: number, sistema: string): string {
    return sistema;
  }

  trackByObra(index: number, obra: FacadeSystem): string {
    return obra.id || `obra-${index}`;
  }



  onSubmit() {
    if (this.obraForm.valid && this.selectedSystems.length > 0 && !this.isSubmitting) {
      const formData = this.obraForm.value;
      
      // Criar objeto com os dados do formulário + sistemas selecionados
      const obraData: Omit<FacadeSystem, 'id'> = {
        title: formData.title,
        location: formData.location,
        system: [...this.selectedSystems], // Usar cópia do array de sistemas selecionados
        construtora: formData.construtora
        // Não incluir imageUrl aqui - será adicionado apenas se houver upload
      };
      
      if (this.isEditing && this.currentObraId) {
        this.updateObra(this.currentObraId, obraData);
      } else {
        this.createObra(obraData);
      }
    } else if (this.selectedSystems.length === 0) {
      this.notificationService.error('Selecione pelo menos um sistema para a obra.');
    }
  }

  editObra(obra: FacadeSystem) {
    if (obra.id) {
      console.log('Editando obra:', obra);
      console.log('Sistemas da obra:', obra.system);
      
      this.isEditing = true;
      this.currentObraId = obra.id;
      this.currentImageUrl = obra.imageUrl || null;
      this.previewUrl = null; // Limpar preview para mostrar imagem atual
      this.selectedFile = null;
      
      // Carregar sistemas selecionados do array da obra, filtrando valores inválidos
      this.selectedSystems = obra.system && Array.isArray(obra.system) 
        ? obra.system.filter(s => s && s !== 'Sistema não definido' && s.trim() !== '')
        : [];
      
      console.log('Sistemas selecionados após filtro:', this.selectedSystems);
      
      this.obraForm.patchValue({
        title: obra.title,
        location: obra.location,
        construtora: obra.construtora
      });
      
      // Forçar detecção de mudanças para atualizar a interface
      this.cdr.detectChanges();
    }
  }

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async createObra(obraData: Omit<FacadeSystem, 'id'>) {
    try {
      console.log('🆕 Criando obra:', obraData.title, 'com sistemas:', obraData.system);
      this.isSubmitting = true;
      
      // Fazer upload da imagem se houver uma selecionada
      if (this.selectedFile) {
        this.isUploading = true;
        const imageUrl = await this.facadeSystemsService.uploadImage(this.selectedFile);
        obraData = { ...obraData, imageUrl };
        this.isUploading = false;
      }

      // Limpar campos undefined antes de enviar ao Firestore
      const cleanedData = this.cleanObjectForFirestore(obraData);

      await this.facadeSystemsService.createFacadeSystem(cleanedData);
      console.log('✅ Obra criada no Firestore');
      
      // Recarregar dados para refletir as mudanças
      this.reloadData();
      
      // Sucesso - limpar formulário
      this.obraForm.reset();
      this.selectedFile = null;
      this.previewUrl = null;
      this.selectedSystems = [];
      
      this.notificationService.success('Obra criada com sucesso!');
      
    } catch (error) {
      console.error('Erro ao criar obra:', error);
      this.notificationService.error('Erro ao criar obra. Tente novamente.');
    } finally {
      this.isSubmitting = false;
      this.isUploading = false;
    }
  }

  async updateObra(id: string, obraData: Partial<FacadeSystem>) {
    try {
      console.log('🔄 Atualizando obra:', id, 'sistemas:', obraData.system);
      this.isSubmitting = true;
      
      // Se há uma nova imagem selecionada, fazer upload
      if (this.selectedFile) {
        this.isUploading = true;
        const imageUrl = await this.facadeSystemsService.uploadImage(this.selectedFile);
        obraData = { ...obraData, imageUrl };
        this.isUploading = false;
      }
      
      // Limpar campos undefined antes de enviar ao Firestore
      const cleanedData = this.cleanObjectForFirestore(obraData);
      
      await this.facadeSystemsService.updateFacadeSystem(id, cleanedData);
      console.log('✅ Obra atualizada no Firestore');
      
      // Recarregar dados para refletir as mudanças
      this.reloadData();
      
      this.notificationService.success('Obra atualizada com sucesso!');
      this.cancelEdit();
      
    } catch (error) {
      console.error('Erro ao atualizar obra:', error);
      this.notificationService.error('Erro ao atualizar obra. Tente novamente.');
    } finally {
      this.isSubmitting = false;
      this.isUploading = false;
    }
  }

  async deleteObra(id: string) {
    if (this.notificationService.confirm('Tem certeza que deseja excluir esta obra? Esta ação não pode ser desfeita.')) {
      try {
        await this.facadeSystemsService.deleteFacadeSystem(id);
        
        // Recarregar dados para refletir as mudanças
        this.reloadData();
        
        this.notificationService.success('Obra excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir obra:', error);
        this.notificationService.error('Erro ao excluir obra. Tente novamente.');
      }
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.currentObraId = null;
    this.currentImageUrl = null;
    this.selectedFile = null;
    this.previewUrl = null;
    this.selectedSystems = []; // Limpar sistemas selecionados
    this.obraForm.reset();
  }

  // Método centralizado para recarregar dados
  private reloadData() {
    console.log('🔄 Recarregando dados...');
    
    // Criar nova instância do Observable para forçar nova consulta
    this.obras$ = this.facadeSystemsService.getFacadeSystems();
    
    this.obras$.subscribe({
      next: (obras) => {
        console.log('✅ Dados recarregados:', obras?.length, 'obras');
        this.obrasArray = obras || [];
        this.updateFilterLists();
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Erro ao recarregar:', error);
      }
    });
  }

  // Método para limpar sistemas inválidos do banco de dados
  async cleanInvalidSystems() {
    if (this.notificationService.confirm('Deseja limpar sistemas inválidos do banco de dados? Esta operação irá remover entradas como "Sistema não definido" de todas as obras.')) {
      try {
        await this.facadeSystemsService.cleanInvalidSystems();
        this.notificationService.success('Limpeza de sistemas inválidos concluída com sucesso!');
        // Recarregar dados após limpeza
        this.reloadData();
      } catch (error) {
        console.error('Erro na limpeza:', error);
        this.notificationService.error('Erro ao executar limpeza. Tente novamente.');
      }
    }
  }
}