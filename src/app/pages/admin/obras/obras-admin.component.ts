import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FacadeSystemsService, FacadeSystem } from '../../../services/facade-systems.service';
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
  previewUrl: string | null = null;

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
    private facadeSystemsService: FacadeSystemsService
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
    if (this.obraForm.valid) {
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
      this.isUploading = true;
      
      // Fazer upload da imagem se houver uma selecionada
      if (this.selectedFile) {
        const imageUrl = await this.facadeSystemsService.uploadImage(this.selectedFile);
        obraData = { ...obraData, imageUrl };
      }

      await this.facadeSystemsService.createFacadeSystem(obraData);
      this.obraForm.reset();
      this.selectedFile = null;
      this.previewUrl = null;
    } catch (error) {
      console.error('Erro ao criar obra:', error);
      // TODO: Adicionar tratamento de erro adequado
    } finally {
      this.isUploading = false;
    }
  }

  async updateObra(id: string, obraData: Partial<FacadeSystem>) {
    try {
      await this.facadeSystemsService.updateFacadeSystem(id, obraData);
      this.cancelEdit();
    } catch (error) {
      console.error('Erro ao atualizar obra:', error);
      // TODO: Adicionar tratamento de erro adequado
    }
  }

  async deleteObra(id: string) {
    if (confirm('Tem certeza que deseja excluir esta obra?')) {
      try {
        await this.facadeSystemsService.deleteFacadeSystem(id);
      } catch (error) {
        console.error('Erro ao excluir obra:', error);
        // TODO: Adicionar tratamento de erro adequado
      }
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.currentObraId = null;
    this.obraForm.reset();
  }
}