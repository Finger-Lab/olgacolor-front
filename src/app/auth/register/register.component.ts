import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  template: `
    <div id="login">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-11 col-lg-6">
            <div class="content-bg"></div>

            <div class="content-login">
              <h3>Cadastre-se</h3>
              
              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                <div class="form-group mt-5">
                  <label for="displayName">Nome</label>
                  <input type="text" class="form-control" id="displayName" 
                         formControlName="displayName" placeholder="Digite seu nome">
                  <div class="text-danger mt-1" 
                       *ngIf="registerForm.get('displayName')?.hasError('required') && registerForm.get('displayName')?.touched">
                    Nome é obrigatório
                  </div>
                </div>

                <div class="form-group mt-3">
                  <label for="email">Email</label>
                  <input type="email" class="form-control" id="email" 
                         formControlName="email" placeholder="Digite seu email">
                  <div class="text-danger mt-1" 
                       *ngIf="registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched">
                    E-mail é obrigatório
                  </div>
                  <div class="text-danger mt-1" 
                       *ngIf="registerForm.get('email')?.hasError('email') && registerForm.get('email')?.touched">
                    E-mail inválido
                  </div>
                </div>

                <div class="form-group mt-3 mb-3">
                  <label for="password">Senha</label>
                  <input type="password" class="form-control" id="password" 
                         formControlName="password" placeholder="Digite sua senha">
                  <div class="text-danger mt-1" 
                       *ngIf="registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched">
                    Senha é obrigatória
                  </div>
                  <div class="text-danger mt-1" 
                       *ngIf="registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched">
                    Senha deve ter no mínimo 6 caracteres
                  </div>
                </div>

                <div class="form-group mt-3 mb-3">
                  <label for="confirmPassword">Confirme a senha</label>
                  <input type="password" class="form-control" id="confirmPassword" 
                         formControlName="confirmPassword" placeholder="Confirme sua senha">
                  <div class="text-danger mt-1" 
                       *ngIf="registerForm.get('confirmPassword')?.hasError('required') && registerForm.get('confirmPassword')?.touched">
                    Confirmação de senha é obrigatória
                  </div>
                  <div class="text-danger mt-1" 
                       *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched">
                    Senhas não conferem
                  </div>
                </div>

                <span (click)="goToLogin()" style="cursor: pointer; font-size: 0.8rem;">
                  Já possui conta? Fazer login
                </span>
              </form>

              <button class="btn btn-outline-dark d-table w-100 mt-5" 
                      [disabled]="registerForm.invalid || isSubmitting"
                      (click)="onSubmit()">
                {{ isSubmitting ? 'Criando conta...' : 'Cadastrar' }}
              </button>
            </div>
          </div>
          
          <div>
            <p>Sistema de Autenticação Olgacolor</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    #login {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center; 
      background-image: url('/assets/images/facades.png');

      .container {
        .row {
          > div {
            padding: 0;
            display: flex;
            border-radius: .5rem;
            overflow: hidden;

            .content-login {
              width: 100%;
              background-color: #ffffffd2;
              padding: 2rem;
              box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
            }

            form {
              span {
                cursor: pointer;
                font-size: .8rem;
                
                &:hover {
                  text-decoration: underline;
                }
              }
            }

            p {
              font-size: 1rem;
              margin-top: 1rem;
              background-color: #ffffffb8;
              font-weight: 600;
              padding: 5px;
              border-radius: 8px;
            }
          }
        }
      }
    }

    .debug-info {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      border: 1px solid #dee2e6;
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

  protected goToLogin(): void {
    this._router.navigate(['/login']);
  }

  protected onSubmit(): void {
    if (this.registerForm.valid && !this.isSubmitting) {
      const { email, password, confirmPassword, displayName } = this.registerForm.value;

      // Verificar se as senhas coincidem
      if (password !== confirmPassword) {
        this._snackBar.open('As senhas não coincidem', 'Fechar', { 
          duration: 3000,
          horizontalPosition: 'end' 
        });
        return;
      }

      this.isSubmitting = true;

      this._authService.register(email, password, displayName)
        .then(() => {
          this._snackBar.open('Conta criada com sucesso! Redirecionando para login...', 'Fechar', {
            duration: 3000,
            horizontalPosition: 'end'
          });
          // Redirecionar para login após sucesso
          setTimeout(() => {
            this._router.navigate(['/login']);
          }, 1500);
        })
        .catch((error: any) => {
          console.error('Erro ao criar conta:', error);
          this._snackBar.open(
            error.message.includes('email-already-in-use') || error.message.includes('já está em uso')
              ? 'Este e-mail já está em uso'
              : error.message || 'Erro ao criar conta. Tente novamente.',
            'Fechar',
            { duration: 5000, horizontalPosition: 'end' }
          );
        })
        .finally(() => {
          this.isSubmitting = false;
        });
    } else {
      this._snackBar.open('Preencha todos os campos corretamente', 'Fechar', { 
        duration: 3000,
        horizontalPosition: 'end' 
      });
    }
  }
}
