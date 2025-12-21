import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  formAuth: FormGroup
  isLoading: boolean = false
  returnUrl: string = '/';
  isSendingReset: boolean = false;
  
  constructor(
    private authService: AuthService, 
    private fb: FormBuilder, 
    private router: Router, 
    private route: ActivatedRoute,
    private snackbar: MatSnackBar
  ) {
    this.createForms()
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }

  async ngOnInit() {
    // Aguardar inicialização da autenticação
    await this.authService.waitForAuthInitialization();
    
    // Obter URL de retorno dos query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    console.log('🔄 URL de retorno:', this.returnUrl);
    
    // Se já estiver logado, redirecionar
    if (this.authService.isLoggedIn) {
      console.log('✅ Usuário já logado, redirecionando para:', this.returnUrl);
      this.router.navigate([this.returnUrl]);
    }
  }

  createForms() {
    this.formAuth = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    })
  }

  // Método para navegar para a página de cadastro
  goToRegister() {
    this.router.navigate(['/cadastre-se']);
  }

  async login() {
    if (this.formAuth.valid && !this.isLoading) {
      this.isLoading = true;
      const { email, password } = this.formAuth.value;
  
      try {
        const user = await this.authService.login(email, password);
        this.snackbar.open('Login realizado com sucesso!', 'Fechar', { duration: 3000 });
        this.navigateToProtectedArea(user);
      } catch (error: any) {
        this.snackbar.open(
          error.message.includes('invalid-credential') || error.message.includes('user-not-found') 
            ? 'Email ou senha inválidos'
            : error.message || 'Erro ao fazer login', 
          'Fechar', 
          { duration: 5000 }
        );
      } finally {
        this.isLoading = false;
      }
    } else {
      this.snackbar.open('Preencha todos os campos corretamente', 'Fechar', { duration: 3000 });
    }
  }

  async onForgotPassword(): Promise<void> {
    const emailControl = this.formAuth.get('email');
    const email = emailControl?.value?.trim();

    if (!email) {
      this.snackbar.open('Informe seu email para redefinir a senha', 'Fechar', { duration: 3000 });
      emailControl?.markAsTouched();
      return;
    }

    if (this.isSendingReset) return;

    this.isSendingReset = true;
    try {
      await this.authService.resetPassword(email);
      this.snackbar.open('Enviamos instruções de redefinição para seu email.', 'Fechar', { duration: 5000 });
    } catch (error: any) {
      this.snackbar.open(error.message || 'Erro ao enviar email de redefinição', 'Fechar', { duration: 5000 });
    } finally {
      this.isSendingReset = false;
    }
  }

  private navigateToProtectedArea(user: any): void {
    // Se houver returnUrl, usar ele (exceto para admin que sempre vai para /admin)
    if (this.returnUrl && this.returnUrl !== '/' && user.role !== 'admin') {
      console.log('🔄 Redirecionando para returnUrl:', this.returnUrl);
      this.router.navigate([this.returnUrl]);
      return;
    }

    if (!user) {
      console.warn('⚠️ Usuário não fornecido para redirecionamento. Usando fallback.');
      this.router.navigate(['/catalogos']);
      return;
    }

    if (user.role === 'admin') {
      this.router.navigate(['/admin']);
      return;
    }

    if (user.role === 'user' || !user.role) {
      this.router.navigate(['/catalogos']);
      return;
    }

    this.router.navigate(['/catalogos']);
  }
}