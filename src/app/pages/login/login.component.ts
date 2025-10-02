import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  formAuth: FormGroup
  isLoading: boolean = false
  
  constructor(
    private authService: AuthService, 
    private fb: FormBuilder, 
    private router: Router, 
    private snackbar: MatSnackBar
  ) {
    this.createForms()
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
    
    // Se já estiver logado, redirecionar
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/dashboard']);
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
        this.router.navigate(['/']);
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
}