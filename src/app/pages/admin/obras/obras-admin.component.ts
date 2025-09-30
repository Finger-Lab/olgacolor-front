import { Component, OnInit } from '@angular/core';
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
  isEditing = false;
  currentObraId: string | null = null;
  selectedFile: File | null = null;
  isUploading = false;
  isSubmitting = false;
  previewUrl: string | null = null;
  currentImageUrl: string | null = null; // Para mostrar imagem atual durante edição

  // Lista de sistemas disponíveis
  readonly systemsList = [
    'Aglo 2.0',
    'Aglo 2.5',
    'Aglo 3.2',
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
    private notificationService: NotificationService
  ) {
    this.obraForm = this.fb.group({
      title: ['', Validators.required],
      location: ['', Validators.required],
      system: ['', Validators.required],
      constructor: ['', Validators.required]
    });

    this.obras$ = this.facadeSystemsService.getFacadeSystems();
  }

  ngOnInit() {
    // Obras já estão sendo carregadas através do Observable obras$
  }

  onSubmit() {
    if (this.obraForm.valid && !this.isSubmitting) {
      const obraData = this.obraForm.value;
      
      if (this.isEditing && this.currentObraId) {
        this.updateObra(this.currentObraId, obraData);
      } else {
        this.createObra(obraData);
      }
    }
  }

  editObra(obra: FacadeSystem) {
    if (obra.id) {
      this.isEditing = true;
      this.currentObraId = obra.id;
      this.currentImageUrl = obra.imageUrl || null;
      this.previewUrl = null; // Limpar preview para mostrar imagem atual
      this.selectedFile = null;
      
      this.obraForm.patchValue({
        title: obra.title,
        location: obra.location,
        system: obra.system,
        constructor: obra.constructor
      });
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
      this.isSubmitting = true;
      
      // Fazer upload da imagem se houver uma selecionada
      if (this.selectedFile) {
        this.isUploading = true;
        const imageUrl = await this.facadeSystemsService.uploadImage(this.selectedFile);
        obraData = { ...obraData, imageUrl };
        this.isUploading = false;
      }

      await this.facadeSystemsService.createFacadeSystem(obraData);
      
      // Sucesso - limpar formulário
      this.obraForm.reset();
      this.selectedFile = null;
      this.previewUrl = null;
      
      // Mostrar mensagem de sucesso
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
      this.isSubmitting = true;
      
      // Se há uma nova imagem selecionada, fazer upload
      if (this.selectedFile) {
        this.isUploading = true;
        const imageUrl = await this.facadeSystemsService.uploadImage(this.selectedFile);
        obraData = { ...obraData, imageUrl };
        this.isUploading = false;
      }
      
      await this.facadeSystemsService.updateFacadeSystem(id, obraData);
      
      // Sucesso
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
    this.obraForm.reset();
  }
}