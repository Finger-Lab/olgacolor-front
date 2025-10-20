import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FacadeSystemsService, FacadeSystem } from '../../../services/facade-systems.service';
import { FacadeSystemTypesService } from '../../../services/facade-system-types.service';
import { FacadeSystemType } from '../../../interfaces/facade-system-type.interface';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-obras-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './obras-admin.component.html',
  styleUrl: './obras-admin.component.scss'
})
export class ObrasAdminComponent implements OnInit {
  obraForm: FormGroup;
  obras$: Observable<FacadeSystem[]>;
  obrasArray: FacadeSystem[] = []; // Array para usar com @for
  filteredObrasArray: FacadeSystem[] = []; // Array filtrado para exibição
  isEditing = false;
  showEditingHighlight = false; // Para controlar o destaque visual temporário
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

  // Lista de sistemas disponíveis (carregada dinamicamente)
  systemsList: string[] = [];
  systemTypesArray: FacadeSystemType[] = [];

  // Seleção múltipla para exclusão em lote
  selectedObras: Set<string> = new Set(); // IDs das obras selecionadas
  selectAll = false; // Estado do checkbox "Selecionar Todos"
  isDeleting = false; // Flag para indicar operação de exclusão em andamento

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
    private systemTypesService: FacadeSystemTypesService,
    private notificationService: NotificationService,
    private authService: AuthService,
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
    // Carregar tipos de sistemas primeiro
    this.loadSystemTypes();
    this.debugSystemsComparison();
    
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

  private loadSystemTypes() {
    this.systemTypesService.getFacadeSystemTypes().subscribe({
      next: async (systemTypes) => {
        console.log('✅ Tipos de sistemas carregados:', systemTypes?.length);
        
        // Se não há tipos de sistema, inicializar os padrões
        if (!systemTypes || systemTypes.length === 0) {
          console.log('🔄 Inicializando tipos de sistemas padrão...');
          try {
            await this.systemTypesService.initializeDefaultSystemTypes();
            // Recarregar após inicialização
            this.loadSystemTypes();
            return;
          } catch (error) {
            console.error('❌ Erro ao inicializar tipos padrão:', error);
          }
        }
        
        this.systemTypesArray = systemTypes || [];
        // Extrair apenas os nomes dos sistemas ativos
        this.systemsList = systemTypes
          .filter(type => type.isActive)
          .map(type => type.displayName || type.name);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar tipos de sistemas:', error);
        // Fallback para lista estática se houver erro
        this.systemsList = [
          'AGLO 2.0',
          'AGLO 2.2 OC',
          'AGLO 2.5 OC',
          'AGLO 3.2 OC',
          'Colato',
          'Lock/s',
          'Lock/sl',
          'Lock/ SL Colato',
          'Lock/HD',
          'Lock/CL',
          'Lock/L',
          'Grid',
          'UniK',
          'Neograd',
          'Delicato',
          'Delicato 2',
          'Delicato 3',
          'Levitare',
          'Imponenza',
          'Stick',
          'Evo Stick',
          'LineaGlass',
          'Slide Glass',
          'Olglass',
          'Gradiluk',
          'Olga Sierra'
        ];
      }
    });
  }

  // Método para obter logo de um sistema específico
  getSystemLogo(systemName: string): string | null {
    const systemType = this.systemTypesArray.find(type => 
      type.displayName === systemName || type.name === systemName
    );
    return systemType?.logoUrl || null;
  }

  // Método para obter o primeiro caractere para fallback quando não há logo
  getSystemInitial(systemName: string): string {
    return systemName ? systemName.charAt(0).toUpperCase() : '?';
  }

  // Método para normalizar nomes de sistemas e encontrar correspondências
  private findSystemMatch(systemFromFirestore: string): string | null {
    // Primeiro, verificar correspondência exata
    if (this.systemsList.includes(systemFromFirestore)) {
      return systemFromFirestore;
    }

    // Se não encontrar correspondência exata, tentar encontrar uma correspondência aproximada
    const normalizedFromFirestore = systemFromFirestore.trim().toLowerCase();
    
    const match = this.systemsList.find(availableSystem => {
      const normalizedAvailable = availableSystem.trim().toLowerCase();
      
      // Verificar se são iguais ignorando case
      if (normalizedFromFirestore === normalizedAvailable) {
        return true;
      }
      
      // Verificar correspondências específicas para sistemas AGLO
      if (normalizedFromFirestore.includes('aglo') && normalizedAvailable.includes('aglo')) {
        // Extrair números e variações (2.0, 2.2, etc.)
        const firestoreNumbers = systemFromFirestore.match(/\d+\.?\d*/g) || [];
        const availableNumbers = availableSystem.match(/\d+\.?\d*/g) || [];
        
        if (firestoreNumbers.length > 0 && availableNumbers.length > 0) {
          return firestoreNumbers[0] === availableNumbers[0];
        }
        
        // Se ambos são apenas "AGLO" sem números
        if (firestoreNumbers.length === 0 && availableNumbers.length === 0) {
          return true;
        }
      }
      
      return false;
    });

    if (match) {
      console.log(`🔄 Mapeamento encontrado: "${systemFromFirestore}" -> "${match}"`);
      return match;
    }

    console.warn(`❌ Nenhuma correspondência encontrada para: "${systemFromFirestore}"`);
    return null;
  }

  private debugSystemsComparison() {
    console.log('🔍 Comparação de sistemas:');
    console.log('📋 Lista estática (systemsList):', this.systemsList);
    
    // Verificar o que está no Firestore
    this.systemTypesService.getFacadeSystemTypes().subscribe((firestoreTypes: any[]) => {
      console.log('🔥 Sistemas do Firestore:', firestoreTypes.map((t: any) => t.name));
      
      // Comparar listas
      const onlyInStatic = this.systemsList.filter(s => !firestoreTypes.some((f: any) => f.name === s));
      const onlyInFirestore = firestoreTypes.filter((f: any) => !this.systemsList.includes(f.name)).map((f: any) => f.name);
      
      console.log('🔶 Apenas na lista estática:', onlyInStatic);
      console.log('🔶 Apenas no Firestore:', onlyInFirestore);
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
    
    // Limpar seleções quando os filtros mudam para evitar inconsistências
    this.clearSelection();
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
    console.log(`🔍 Verificando seleção para sistema: "${system}"`);
    console.log(`📋 Sistemas selecionados:`, this.selectedSystems);
    
    if (!this.selectedSystems || this.selectedSystems.length === 0) {
      console.log(`❌ Nenhum sistema selecionado`);
      return false;
    }

    // Verificar correspondência exata primeiro
    const exactMatch = this.selectedSystems.includes(system);
    if (exactMatch) {
      console.log(`✅ Correspondência exata encontrada para: "${system}"`);
      return true;
    }

    // Se não encontrar correspondência exata, tentar normalização
    const normalizedMatch = this.selectedSystems.some(sistemaFormulario => {
      const match = this.findSystemMatch(sistemaFormulario);
      const isMatch = match === system;
      
      if (isMatch) {
        console.log(`✅ Correspondência via normalização: "${sistemaFormulario}" -> "${system}"`);
      }
      
      return isMatch;
    });

    // Log específico para sistemas AGLO
    if (system.toLowerCase().includes('aglo')) {
      console.log(`🎯 Verificação especial AGLO para "${system}":`, {
        sistemasBrutos: this.selectedSystems,
        correspondenciaExata: exactMatch,
        correspondenciaNormalizada: normalizedMatch
      });
    }

    return normalizedMatch;
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
      
      console.log('📝 Dados do formulário:', formData);
      console.log('🏗️ Construtora do formulário:', formData.construtora);
      
      // Criar objeto com os dados do formulário + sistemas selecionados
      const obraData: Omit<FacadeSystem, 'id'> = {
        title: formData.title,
        location: formData.location,
        system: [...this.selectedSystems], // Usar cópia do array de sistemas selecionados
        construtora: formData.construtora
        // Não incluir imageUrl aqui - será adicionado apenas se houver upload
      };
      
      console.log('📤 Dados da obra a serem enviados:', obraData);
      
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
      console.log('🔄 Editando obra:', obra);
      console.log('📋 Sistemas da obra:', obra.system);
      console.log('📋 Lista de sistemas disponíveis:', this.systemsList);
      
      this.isEditing = true;
      this.currentObraId = obra.id;
      this.currentImageUrl = obra.imageUrl || null;
      this.previewUrl = null; // Limpar preview para mostrar imagem atual
      this.selectedFile = null;
      
      // Carregar sistemas selecionados do array da obra, filtrando valores inválidos
      const systemsFromObra = obra.system && Array.isArray(obra.system) 
        ? obra.system.filter(s => s && s !== 'Sistema não definido' && s.trim() !== '')
        : [];
      
      console.log('📋 Sistemas brutos da obra após filtro:', systemsFromObra);
      
      // Normalizar os sistemas para corresponder com a lista disponível
      this.selectedSystems = [];
      systemsFromObra.forEach(sistema => {
        const match = this.findSystemMatch(sistema);
        if (match) {
          console.log(`� Sistema normalizado: "${sistema}" -> "${match}"`);
          this.selectedSystems.push(match);
        } else {
          console.warn(`⚠️ Sistema "${sistema}" não pode ser normalizado, mantendo original`);
          this.selectedSystems.push(sistema); // Manter o original se não encontrar correspondência
        }
      });
      
      console.log('✅ Sistemas selecionados após normalização:', this.selectedSystems);
      
      this.obraForm.patchValue({
        title: obra.title,
        location: obra.location,
        construtora: obra.construtora
      });
      
      // Forçar detecção de mudanças para atualizar a interface
      this.cdr.detectChanges();
      
      // Fazer scroll até o formulário
      setTimeout(() => {
        const formElement = document.getElementById('obra-form');
        if (formElement) {
          // Ativar destaque visual
          this.showEditingHighlight = true;
          
          formElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
          
          // Remover destaque após 2 segundos
          setTimeout(() => {
            this.showEditingHighlight = false;
            this.cdr.detectChanges();
          }, 2000);
        }
      }, 100);
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

  // Método para verificar autenticação antes de operações sensíveis
  private checkAuthentication(): boolean {
    if (!this.authService.isLoggedIn) {
      this.notificationService.error('Você não está autenticado. Faça login para continuar.');
      return false;
    }
    
    if (!this.authService.isAdmin) {
      this.notificationService.error('Você não tem permissão de administrador para esta operação.');
      return false;
    }
    
    return true;
  }

  async createObra(obraData: Omit<FacadeSystem, 'id'>) {
    // Verificar autenticação antes de prosseguir
    if (!this.checkAuthentication()) {
      return;
    }

    try {
      console.log('🆕 Criando obra:', obraData.title, 'com sistemas:', obraData.system);
      console.log('🏗️ Construtora a ser salva:', obraData.construtora);
      console.log('👤 Usuário autenticado:', this.authService.currentUser?.email, 'Role:', this.authService.currentUser?.role);
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
      console.log('✨ Dados limpos para o Firestore:', cleanedData);

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
      
    } catch (error: any) {
      console.error('Erro ao criar obra:', error);
      
      let errorMessage = 'Erro ao criar obra. Tente novamente.';
      
      if (error.message && error.message.includes('não autenticado')) {
        errorMessage = 'Você não está autenticado. Faça login novamente.';
      } else if (error.message && error.message.includes('autorização')) {
        errorMessage = 'Erro de permissão: Você não tem autorização para fazer upload de imagens. Verifique se está logado como administrador.';
      } else if (error.message && error.message.includes('Firebase Storage')) {
        errorMessage = 'Erro no upload da imagem: ' + error.message;
      } else if (error.message) {
        errorMessage = 'Erro: ' + error.message;
      }
      
      this.notificationService.error(errorMessage);
    } finally {
      this.isSubmitting = false;
      this.isUploading = false;
    }
  }

  async updateObra(id: string, obraData: Partial<FacadeSystem>) {
    // Verificar autenticação antes de prosseguir
    if (!this.checkAuthentication()) {
      return;
    }

    try {
      console.log('🔄 Atualizando obra:', id, 'sistemas:', obraData.system);
      console.log('🏗️ Construtora a ser salva:', obraData.construtora);
      console.log('👤 Usuário autenticado:', this.authService.currentUser?.email, 'Role:', this.authService.currentUser?.role);
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
      console.log('✨ Dados limpos para o Firestore:', cleanedData);
      
      await this.facadeSystemsService.updateFacadeSystem(id, cleanedData);
      console.log('✅ Obra atualizada no Firestore');
      
      // Recarregar dados para refletir as mudanças
      this.reloadData();
      
      this.notificationService.success('Obra atualizada com sucesso!');
      
    } catch (error: any) {
      console.error('Erro ao atualizar obra:', error);
      
      let errorMessage = 'Erro ao atualizar obra. Tente novamente.';
      
      if (error.message && error.message.includes('não autenticado')) {
        errorMessage = 'Você não está autenticado. Faça login novamente.';
      } else if (error.message && error.message.includes('autorização')) {
        errorMessage = 'Erro de permissão: Você não tem autorização para fazer upload de imagens. Verifique se está logado como administrador.';
      } else if (error.message && error.message.includes('Firebase Storage')) {
        errorMessage = 'Erro no upload da imagem: ' + error.message;
      } else if (error.message) {
        errorMessage = 'Erro: ' + error.message;
      }
      
      this.notificationService.error(errorMessage);
      this.cancelEdit();
      
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
    console.log('📝 Cancelando edição...');
    
    this.isEditing = false;
    this.currentObraId = null;
    this.currentImageUrl = null;
    this.selectedFile = null;
    this.previewUrl = null;
    this.selectedSystems = []; // Limpar sistemas selecionados
    this.obraForm.reset();
    
    // Scroll suave para a lista de obras
    setTimeout(() => {
      const obrasListElement = document.querySelector('.table-responsive');
      if (obrasListElement) {
        obrasListElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
    
    // Feedback visual
    this.notificationService.info('Edição cancelada');
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

  // ============= MÉTODOS DE SELEÇÃO MÚLTIPLA =============

  // Verifica se uma obra está selecionada
  isObraSelected(obraId: string): boolean {
    return this.selectedObras.has(obraId);
  }

  // Seleciona/deseleciona uma obra individual
  toggleObraSelection(obraId: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    
    if (checkbox.checked) {
      this.selectedObras.add(obraId);
    } else {
      this.selectedObras.delete(obraId);
    }

    // Atualizar estado do "Selecionar Todos"
    this.updateSelectAllState();
  }

  // Seleciona/deseleciona todas as obras visíveis
  toggleSelectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.selectAll = checkbox.checked;

    if (this.selectAll) {
      // Selecionar todas as obras filtradas
      this.filteredObrasArray.forEach(obra => {
        if (obra.id) {
          this.selectedObras.add(obra.id);
        }
      });
    } else {
      // Desselecionar todas
      this.selectedObras.clear();
    }
  }

  // Atualiza o estado do checkbox "Selecionar Todos"
  private updateSelectAllState(): void {
    const filteredObraIds = this.filteredObrasArray
      .filter(obra => obra.id)
      .map(obra => obra.id!);
    
    const selectedFilteredObras = filteredObraIds.filter(id => this.selectedObras.has(id));
    
    this.selectAll = filteredObraIds.length > 0 && selectedFilteredObras.length === filteredObraIds.length;
  }

  // Retorna o número de obras selecionadas
  get selectedObrasCount(): number {
    return this.selectedObras.size;
  }

  // Excluir obras selecionadas
  async deleteSelectedObras(): Promise<void> {
    if (this.selectedObras.size === 0) {
      this.notificationService.warning('Nenhuma obra selecionada para exclusão.');
      return;
    }

    const confirmMessage = `Tem certeza que deseja excluir ${this.selectedObras.size} obra(s) selecionada(s)? Esta ação não pode ser desfeita.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    this.isDeleting = true;
    
    try {
      const deletePromises = Array.from(this.selectedObras).map(obraId => 
        this.facadeSystemsService.deleteFacadeSystem(obraId)
      );

      await Promise.all(deletePromises);
      
      this.notificationService.success(`${this.selectedObras.size} obra(s) excluída(s) com sucesso!`);
      
      // Limpar seleções
      this.selectedObras.clear();
      this.selectAll = false;
      
      // Recarregar dados
      this.reloadData();
      
    } catch (error) {
      console.error('Erro ao excluir obras:', error);
      this.notificationService.error('Erro ao excluir algumas obras. Tente novamente.');
    } finally {
      this.isDeleting = false;
    }
  }

  // Limpar todas as seleções
  clearSelection(): void {
    this.selectedObras.clear();
    this.selectAll = false;
  }
}