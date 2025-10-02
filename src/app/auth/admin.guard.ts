import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // Verificar se o usuário está logado
    if (!this.authService.isLoggedIn) {
      console.log('🚫 Acesso negado: usuário não autenticado');
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    }

    // Obter roles permitidas da rota
    const allowedRoles = route.data?.['roles'] as string[];
    
    // Se não há roles especificadas, permitir acesso para usuários logados
    if (!allowedRoles || allowedRoles.length === 0) {
      console.log('✅ Acesso autorizado (sem restrições de role):', this.authService.currentUser?.email);
      return true;
    }

    // Verificar se a rota permite usuários normais
    if (allowedRoles.includes('User')) {
      console.log('✅ Acesso autorizado para usuário:', this.authService.currentUser?.email);
      return true;
    }

    // Verificar se a rota requer admin e o usuário é admin
    if (allowedRoles.includes('Admin') && this.authService.isAdmin) {
      console.log('✅ Acesso autorizado para admin:', this.authService.currentUser?.email);
      return true;
    }

    // Se chegou até aqui, o usuário não tem permissão
    console.log('🚫 Acesso negado: permissões insuficientes');
    console.log('Roles necessárias:', allowedRoles);
    console.log('Usuário é admin:', this.authService.isAdmin);
    this.router.navigate(['/']);
    return false;
  }
}
