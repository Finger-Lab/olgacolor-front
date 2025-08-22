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
  isLogin: boolean = true
  
  constructor(
    private authService: AuthService, 
    private fb: FormBuilder, 
    private router: Router, 
    private snackbar: MatSnackBar
  ) {
    this.createForms()

    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }

  createForms() {
    this.formAuth = this.fb.group({
      name: [''],
      email: [''],
      password: [''],
      password_confirmation: ['']
    })

    this.setValidators()
  }

  setValidators() {
    if (this.isLogin) {
      this.formAuth.get('name')?.clearValidators()
      this.formAuth.get('password_confirmation')?.clearValidators()
    } else {
      this.formAuth.get('name')?.setValidators([Validators.required])
      this.formAuth.get('password_confirmation')?.setValidators([Validators.required])
    }
  
    this.formAuth.get('email')?.setValidators([Validators.required, Validators.email])
    this.formAuth.get('password')?.setValidators([Validators.required])
  
    Object.keys(this.formAuth.controls).forEach((field) => {
      this.formAuth.get(field)?.updateValueAndValidity()
    })
  }
  
  toggleMode() {
    this.isLogin = !this.isLogin
    this.setValidators()
    this.formAuth.reset() 
  }

  login() {
    if (this.formAuth.valid) {
      const { email, password } = this.formAuth.value
  
      this.authService.login(email, password).subscribe({
        next: (response) => {
          if (response.access_token) {
            if (typeof window !== 'undefined') {
              localStorage.setItem('token', response.access_token)
            }

            this.authService.getUser().subscribe({
              next: (user) => {
                console.log(user)
                this.snackbar.open("Login realizado com sucesso", 'Fechar', { duration: 3000 })
                       this.router.navigate(['/catalogos'])
                // // if (user.role === 'Admin') {
                //   this.router.navigate(['/mercados/adicionar-mercados'])
                // } else if (user.role === 'User') {
                //   this.router.navigate(['/mercados/categorias'])
                // } else {
                //   this.router.navigate(['/login'])
                // }
              },
              error: () => {
                this.snackbar.open("Erro ao obter dados do usuário", 'Fechar', { duration: 3000 })
                this.router.navigate(['/login'])
              }
            })
          }
        },
        error: () => {
          this.snackbar.open("Erro ao fazer login. Verifique suas credenciais", 'Fechar', { duration: 3000 })
        }
      })
    } else {
      this.snackbar.open("Preencha todos os campos corretamente", 'Fechar', { duration: 3000 })
    }
  }
  
  register() {
    if (this.formAuth.valid) {
      const { name, email, password, password_confirmation } = this.formAuth.value
  
      if (password !== password_confirmation) {
        this.snackbar.open("As senhas não coincidem", 'Fechar', { duration: 3000 })
        return
      }
  
      this.authService.register(name, email, password).subscribe({
        next: (response) => {
          if (response.access_token) {
            if (typeof window !== 'undefined') {
              localStorage.setItem('token', response.access_token)
            }
            
            this.snackbar.open("Cadastro realizado com sucesso", 'Fechar', { duration: 3000 })
            this.formAuth.reset()
            this.isLogin = true
            this.setValidators()
          }
        },
        error: () => {
          this.snackbar.open("Erro ao registrar. Tente novamente", 'Fechar', { duration: 3000 })
        }
      })
    } else {
      this.snackbar.open("Preencha todos os campos corretamente", 'Fechar', { duration: 3000 })
    }
  }  
}