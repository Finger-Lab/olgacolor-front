import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface DashboardItem {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  adminOnly?: boolean;
  available: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  currentUser: any = null;
  isAdmin = false;
  currentDate = new Date();

  dashboardItems: DashboardItem[] = [
    {
      title: 'Painel Admin',
      description: 'Acesso completo ao sistema administrativo',
      icon: 'bi-speedometer2',
      route: '/admin',
      color: 'danger',
      adminOnly: true,
      available: true
    },
    {
      title: 'Catálogos',
      description: 'Visualizar e gerenciar catálogos de produtos',
      icon: 'bi-book',
      route: '/catalogos',
      color: 'primary',
      available: true
    },
    {
      title: 'Categorias',
      description: 'Navegar pelas categorias de produtos',
      icon: 'bi-grid-3x3-gap',
      route: '/mercados/categorias',
      color: 'success',
      available: true
    },
    {
      title: 'Produtos',
      description: 'Visualizar produtos por categoria',
      icon: 'bi-box-seam',
      route: '/mercados/categorias/produtos',
      color: 'info',
      available: true
    },
    {
      title: 'Adicionar Mercados',
      description: 'Gerenciar e adicionar novos mercados',
      icon: 'bi-plus-circle',
      route: '/mercados/adicionar-mercados',
      color: 'warning',
      adminOnly: true,
      available: true
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.checkAdminStatus();
    });
  }

  private checkAdminStatus(): void {
    if (this.currentUser) {
      // Verificar se o usuário tem papel de admin
      this.isAdmin = this.currentUser.role === 'Admin' || 
                     this.currentUser.roles?.includes('Admin') ||
                     this.currentUser.email?.includes('admin'); // fallback
    }
  }

  getAvailableItems(): DashboardItem[] {
    return this.dashboardItems.filter(item => {
      if (item.adminOnly && !this.isAdmin) {
        return false;
      }
      return item.available;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}