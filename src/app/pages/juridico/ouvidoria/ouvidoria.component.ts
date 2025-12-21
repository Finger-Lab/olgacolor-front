import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-ouvidoria',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ouvidoria.component.html',
  styleUrl: './ouvidoria.component.scss'
})
export class OuvidoriaComponent {
  protected readonly classScrolled = 'scrolled position-sticky';
  ouvidoriaForm: FormGroup;
  showSuccessMessage = false;

  constructor(private fb: FormBuilder) {
    this.ouvidoriaForm = this.fb.group({
      tipoMelhoria: ['', Validators.required],
      identificar: [false],
      nome: [''],
      email: [''],
      telefone: [''],
      mensagem: ['', Validators.required]
    });

    // Adicionar validação condicional para campos de identificação
    this.ouvidoriaForm.get('identificar')?.valueChanges.subscribe(identificar => {
      if (identificar) {
        this.ouvidoriaForm.get('nome')?.setValidators([Validators.required]);
        this.ouvidoriaForm.get('email')?.setValidators([Validators.required, Validators.email]);
        this.ouvidoriaForm.get('telefone')?.setValidators([Validators.required]);
      } else {
        this.ouvidoriaForm.get('nome')?.clearValidators();
        this.ouvidoriaForm.get('email')?.clearValidators();
        this.ouvidoriaForm.get('telefone')?.clearValidators();
        this.ouvidoriaForm.get('nome')?.setValue('');
        this.ouvidoriaForm.get('email')?.setValue('');
        this.ouvidoriaForm.get('telefone')?.setValue('');
      }
      this.ouvidoriaForm.get('nome')?.updateValueAndValidity();
      this.ouvidoriaForm.get('email')?.updateValueAndValidity();
      this.ouvidoriaForm.get('telefone')?.updateValueAndValidity();
    });
  }

  onSubmit() {
    if (this.ouvidoriaForm.valid) {
      // Aqui você pode enviar os dados para um serviço/API
      console.log('Formulário enviado:', this.ouvidoriaForm.value);
      this.showSuccessMessage = true;
      this.ouvidoriaForm.reset();
      this.ouvidoriaForm.get('identificar')?.setValue(false);
      
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 5000);
    }
  }
}
