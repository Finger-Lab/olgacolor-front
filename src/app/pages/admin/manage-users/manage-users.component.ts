import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="manage-users-container">
      <h2>Gerenciamento de Usuários</h2>
      <p>Interface de gerenciamento de usuários em desenvolvimento.</p>
    </div>
  `,
  styles: [`
    .manage-users-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;

      h2 {
        color: var(--text-primary);
        margin-bottom: 1rem;
      }

      p {
        color: var(--text-secondary);
      }
    }
  `]
})
export class ManageUsersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  protected loading = signal(false);

  ngOnInit(): void {
    // TODO: Implementar inicialização
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}