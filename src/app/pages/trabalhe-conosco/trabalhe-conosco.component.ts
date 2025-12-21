import { Component, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-trabalhe-conosco',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './trabalhe-conosco.component.html',
  styleUrls: ['./trabalhe-conosco.component.scss']
})
export class TrabalheConoscoComponent implements OnInit {
  protected form!: FormGroup;
  protected isLoading = signal<boolean>(false);
  protected selectedFileName = signal<string>('');
  protected selectedFile: File | null = null;
  protected classScrolled: string = 'scrolled';

  protected vagas = [
    'Operador de Produção',
    'Analista de Qualidade',
    'Engenheiro de Processos',
    'Técnico de Manutenção',
    'Assistente Administrativo',
    'Vendedor',
    'Auxiliar de Logística',
    'Outras'
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.onWindowScroll();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.classScrolled = scrollPosition > 50 ? 'scrolled' : '';
  }

  private initForm(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.pattern(/^\(?[1-9]{2}\)? ?(?:[2-8]|9[0-9])[0-9]{3}\-?[0-9]{4}$/)]],
      vaga: ['', Validators.required]
    });
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validar tipo de arquivo (apenas PDF e DOC/DOCX)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        this.snackBar.open('Por favor, envie apenas arquivos PDF ou DOC/DOCX', 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        input.value = '';
        return;
      }

      // Validar tamanho (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.snackBar.open('O arquivo deve ter no máximo 5MB', 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        input.value = '';
        return;
      }

      this.selectedFile = file;
      this.selectedFileName.set(file.name);
    }
  }

  protected removeFile(): void {
    this.selectedFile = null;
    this.selectedFileName.set('');
    const fileInput = document.getElementById('curriculo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios', 'Fechar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!this.selectedFile) {
      this.snackBar.open('Por favor, anexe seu currículo', 'Fechar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading.set(true);

    try {
      // Aqui você pode implementar o envio para o backend
      // Por enquanto, vamos simular o envio
      await this.simulateSubmit();

      this.snackBar.open('Currículo enviado com sucesso! Entraremos em contato em breve.', 'Fechar', {
        duration: 5000,
        panelClass: ['success-snackbar']
      });

      // Resetar formulário
      this.form.reset();
      this.removeFile();
    } catch (error) {
      console.error('Erro ao enviar currículo:', error);
      this.snackBar.open('Erro ao enviar currículo. Tente novamente.', 'Fechar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  private simulateSubmit(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Dados do formulário:', this.form.value);
        console.log('Arquivo:', this.selectedFile);
        resolve();
      }, 2000);
    });
  }

  protected getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) return 'Campo obrigatório';
    if (field.errors['email']) return 'Email inválido';
    if (field.errors['minLength']) return `Mínimo de ${field.errors['minLength'].requiredLength} caracteres`;
    if (field.errors['pattern']) return 'Formato inválido';

    return '';
  }
}

