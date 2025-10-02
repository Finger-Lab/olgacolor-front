import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { User, UserCreateRequest } from '../../../interfaces/user.interface';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule,
    RouterLink
  ],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.scss'
})
export class ManageUsersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  users: User[] = [];
  displayedColumns: string[] = ['displayName', 'email', 'role', 'isActive', 'createdAt', 'actions'];
  isLoading = signal(false);
  showAddForm = signal(false);
  
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.userForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['user', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    
    // Subscribe to users changes
    this.userService.users$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = users;
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Erro ao carregar usuários:', error);
          this.snackBar.open('Erro ao carregar usuários', 'Fechar', { duration: 5000 });
          this.isLoading.set(false);
        }
      });
  }

  async onSubmit(): Promise<void> {
    if (this.userForm.valid && !this.isLoading()) {
      this.isLoading.set(true);
      
      try {
        const formData = this.userForm.value;
        
        const userData: UserCreateRequest = {
          email: formData.email,
          displayName: formData.displayName,
          role: formData.role,
          password: formData.password
        };

        await this.userService.createUser(userData);
        
        this.snackBar.open('Usuário criado com sucesso!', 'Fechar', { duration: 3000 });
        this.userForm.reset();
        this.userForm.patchValue({ role: 'user' });
        this.showAddForm.set(false);
        
      } catch (error: any) {
        console.error('Erro ao criar usuário:', error);
        this.snackBar.open(error.message || 'Erro ao criar usuário', 'Fechar', { duration: 5000 });
      } finally {
        this.isLoading.set(false);
      }
    } else {
      this.snackBar.open('Preencha todos os campos corretamente', 'Fechar', { duration: 3000 });
    }
  }

  async toggleUserRole(user: User): Promise<void> {
    try {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      await this.userService.updateUser(user.uid, { role: newRole });
      this.snackBar.open(`Usuário ${user.displayName} agora é ${newRole}`, 'Fechar', { duration: 3000 });
    } catch (error: any) {
      console.error('Erro ao alterar role:', error);
      this.snackBar.open('Erro ao alterar permissão do usuário', 'Fechar', { duration: 5000 });
    }
  }

  async toggleUserStatus(user: User): Promise<void> {
    try {
      if (user.isActive) {
        await this.userService.deactivateUser(user.uid);
        this.snackBar.open(`Usuário ${user.displayName} foi desativado`, 'Fechar', { duration: 3000 });
      } else {
        await this.userService.activateUser(user.uid);
        this.snackBar.open(`Usuário ${user.displayName} foi ativado`, 'Fechar', { duration: 3000 });
      }
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      this.snackBar.open('Erro ao alterar status do usuário', 'Fechar', { duration: 5000 });
    }
  }

  async deleteUser(user: User): Promise<void> {
    if (confirm(`Deseja realmente excluir o usuário ${user.displayName || user.email}?`)) {
      try {
        await this.userService.deleteUser(user.uid);
        this.snackBar.open('Usuário excluído com sucesso!', 'Fechar', { duration: 3000 });
      } catch (error: any) {
        console.error('Erro ao excluir usuário:', error);
        this.snackBar.open('Erro ao excluir usuário', 'Fechar', { duration: 5000 });
      }
    }
  }

  toggleAddForm(): void {
    this.showAddForm.set(!this.showAddForm());
    if (!this.showAddForm()) {
      this.userForm.reset();
      this.userForm.patchValue({ role: 'user' });
    }
  }

  getUserRoleColor(role: string): string {
    return role === 'admin' ? 'warn' : 'primary';
  }

  getUserStatusColor(isActive: boolean): string {
    return isActive ? 'primary' : 'warn';
  }
}