import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FacadeSystemTypesService } from '../../../services/facade-system-types.service';
import { NotificationService } from '../../../services/notification.service';
import { FacadeSystemType } from '../../../interfaces/facade-system-type.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-system-types-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './system-types-admin.component.html',
  styleUrls: ['./system-types-admin.component.scss']
})
export class SystemTypesAdminComponent implements OnInit {
  systemTypeForm: FormGroup;
  systemTypes$: Observable<FacadeSystemType[]>;
  systemTypesArray: FacadeSystemType[] = [];
  
  isEditing = false;
  currentSystemTypeId: string | null = null;
  selectedFile: File | null = null;
  isUploading = false;
  isSubmitting = false;
  previewUrl: string | null = null;
  currentLogoUrl: string | null = null;

  // Filtros
  searchTerm = '';
  showInactiveOnly = false;

  constructor(
    private fb: FormBuilder,
    private systemTypesService: FacadeSystemTypesService,
    private notificationService: NotificationService
  ) {
    this.systemTypeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      displayName: [''],
      description: [''],
      isActive: [true]
    });

    this.systemTypes$ = this.systemTypesService.getFacadeSystemTypes();
  }

  ngOnInit() {
    this.loadSystemTypes();
  }

  private loadSystemTypes() {
    this.systemTypes$.subscribe({
      next: (types) => {
        console.log('✅ Tipos de sistemas carregados:', types?.length);
        this.systemTypesArray = types || [];
      },
      error: (error) => {
        console.error('❌ Erro ao carregar tipos de sistemas:', error);
        this.notificationService.error('Erro ao carregar tipos de sistemas');
      }
    });
  }

  get filteredSystemTypes(): FacadeSystemType[] {
    let filtered = this.systemTypesArray;

    // Filtro por status
    if (this.showInactiveOnly) {
      filtered = filtered.filter(type => !type.isActive);
    }

    // Filtro por busca
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(type =>
        type.name.toLowerCase().includes(searchLower) ||
        type.displayName?.toLowerCase().includes(searchLower) ||
        type.description?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }

  onFileSelected(event: Event) {
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

  async onSubmit() {
    if (this.systemTypeForm.valid && !this.isSubmitting) {
      const formData = this.systemTypeForm.value;
      
      try {
        this.isSubmitting = true;
        
        if (this.isEditing && this.currentSystemTypeId) {
          await this.updateSystemType(formData);
        } else {
          await this.createSystemType(formData);
        }
        
        // Upload do logo se houver arquivo selecionado
        if (this.selectedFile && this.currentSystemTypeId) {
          await this.uploadLogo();
        }
        
        this.resetForm();
        this.loadSystemTypes();
        
      } catch (error) {
        console.error('❌ Erro ao salvar tipo de sistema:', error);
        this.notificationService.error('Erro ao salvar tipo de sistema');
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  private async createSystemType(formData: any) {
    await this.systemTypesService.createFacadeSystemType({
      name: formData.name,
      displayName: formData.displayName || formData.name,
      description: formData.description,
      isActive: formData.isActive
    });
    
    this.notificationService.success('Tipo de sistema criado com sucesso!');
  }

  private async updateSystemType(formData: any) {
    if (!this.currentSystemTypeId) return;
    
    await this.systemTypesService.updateFacadeSystemType(this.currentSystemTypeId, {
      name: formData.name,
      displayName: formData.displayName || formData.name,
      description: formData.description,
      isActive: formData.isActive
    });
    
    this.notificationService.success('Tipo de sistema atualizado com sucesso!');
  }

  private async uploadLogo() {
    if (!this.selectedFile || !this.currentSystemTypeId) return;
    
    try {
      this.isUploading = true;
      await this.systemTypesService.uploadLogo(this.selectedFile, this.currentSystemTypeId);
      this.notificationService.success('Logo enviado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao enviar logo:', error);
      this.notificationService.error('Erro ao enviar logo');
    } finally {
      this.isUploading = false;
    }
  }

  editSystemType(systemType: FacadeSystemType) {
    this.isEditing = true;
    this.currentSystemTypeId = systemType.id!;
    this.currentLogoUrl = systemType.logoUrl || null;
    this.previewUrl = null;
    this.selectedFile = null;
    
    this.systemTypeForm.patchValue({
      name: systemType.name,
      displayName: systemType.displayName,
      description: systemType.description,
      isActive: systemType.isActive
    });
  }

  async deleteSystemType(systemType: FacadeSystemType) {
    if (!systemType.id) return;
    
    const confirmed = confirm(`Tem certeza que deseja excluir o tipo de sistema "${systemType.displayName || systemType.name}"?`);
    if (!confirmed) return;
    
    try {
      // Deletar logo se existir
      if (systemType.logoUrl) {
        await this.systemTypesService.deleteLogo(systemType.id, systemType.logoUrl);
      }
      
      await this.systemTypesService.deleteFacadeSystemType(systemType.id);
      this.notificationService.success('Tipo de sistema excluído com sucesso!');
      this.loadSystemTypes();
    } catch (error) {
      console.error('❌ Erro ao excluir tipo de sistema:', error);
      this.notificationService.error('Erro ao excluir tipo de sistema');
    }
  }

  async deleteLogo(systemType: FacadeSystemType) {
    if (!systemType.id || !systemType.logoUrl) return;
    
    const confirmed = confirm('Tem certeza que deseja remover o logo?');
    if (!confirmed) return;
    
    try {
      await this.systemTypesService.deleteLogo(systemType.id, systemType.logoUrl);
      this.notificationService.success('Logo removido com sucesso!');
      this.loadSystemTypes();
    } catch (error) {
      console.error('❌ Erro ao remover logo:', error);
      this.notificationService.error('Erro ao remover logo');
    }
  }

  resetForm() {
    this.isEditing = false;
    this.currentSystemTypeId = null;
    this.selectedFile = null;
    this.previewUrl = null;
    this.currentLogoUrl = null;
    this.systemTypeForm.reset({
      isActive: true
    });
  }

  cancelEdit() {
    console.log('📝 Cancelando edição...');
    
    this.resetForm();
    
    // Scroll suave para a lista de tipos de sistemas
    setTimeout(() => {
      const systemTypesListElement = document.querySelector('.table-responsive');
      if (systemTypesListElement) {
        systemTypesListElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
    
    // Feedback visual
    this.notificationService.info('Edição cancelada');
  }

  async initializeDefaultTypes() {
    const confirmed = confirm('Isso irá criar todos os tipos de sistemas padrão. Continuar?');
    if (!confirmed) return;
    
    try {
      await this.systemTypesService.initializeDefaultSystemTypes();
      this.notificationService.success('Tipos padrão inicializados com sucesso!');
      this.loadSystemTypes();
    } catch (error) {
      console.error('❌ Erro ao inicializar tipos padrão:', error);
      this.notificationService.error('Erro ao inicializar tipos padrão');
    }
  }

  deleteCurrentLogo() {
    if (!this.currentSystemTypeId || !this.currentLogoUrl) return;
    this.deleteLogo({ id: this.currentSystemTypeId, logoUrl: this.currentLogoUrl } as FacadeSystemType);
  }

  formatTimestamp(timestamp: any): Date {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    return timestamp instanceof Date ? timestamp : new Date(timestamp);
  }
}