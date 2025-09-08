import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h2>Criar Conta</h2>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
          <mat-form-field>
            <mat-label>Nome</mat-label>
            <input matInput formControlName="displayName">
            <mat-error *ngIf="registerForm.get('displayName')?.hasError('required')">
              Nome é obrigatório
            </mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>E-mail</mat-label>
            <input matInput type="email" formControlName="email">
            <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
              E-mail é obrigatório
            </mat-error>
            <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
              E-mail inválido
            </mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Senha</mat-label>
            <input matInput type="password" formControlName="password">
            <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
              Senha é obrigatória
            </mat-error>
            <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
              Senha deve ter no mínimo 6 caracteres
            </mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Confirmar Senha</mat-label>
            <input matInput type="password" formControlName="confirmPassword">
            <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
              Confirmação de senha é obrigatória
            </mat-error>
            <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">
              Senhas não conferem
            </mat-error>
          </mat-form-field>

          <div class="form-actions">
            <button mat-button type="button" routerLink="/login">Voltar</button>
            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="registerForm.invalid || isSubmitting">
              <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
              <span *ngIf="!isSubmitting">Criar Conta</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      background: var(--background-default);
    }

    .register-card {
      width: 100%;
      max-width: 400px;
      padding: 2rem;
      background: var(--background-card);
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

      h2 {
        margin-bottom: 2rem;
        text-align: center;
        color: var(--text-primary);
      }
    }

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      mat-form-field {
        width: 100%;
      }
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;

      button {
        min-width: 100px;
      }
    }

    mat-spinner {
      margin: 0 auto;
    }
  `]
})
export class RegisterComponent {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly _router = inject(Router);

  protected isSubmitting = false;
  protected registerForm: FormGroup = this._formBuilder.group({
    displayName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validator: this.passwordMatchValidator });

  private passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { passwordMismatch: true };
  }

  protected onSubmit(): void {
    if (this.registerForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const { email, password, displayName } = this.registerForm.value;

      this._authService.register(email, password, displayName)
        .subscribe({
          next: () => {
            this._snackBar.open('Conta criada com sucesso!', 'Fechar', {
              duration: 3000,
              horizontalPosition: 'end'
            });
            this._router.navigate(['/login']);
          },
          error: (error) => {
            console.error('Erro ao criar conta:', error);
            this._snackBar.open(
              error.code === 'auth/email-already-in-use'
                ? 'Este e-mail já está em uso'
                : 'Erro ao criar conta. Tente novamente.',
              'Fechar',
              { duration: 3000, horizontalPosition: 'end' }
            );
            this.isSubmitting = false;
          }
        });
    }
  }
}
