import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, User, authState, onAuthStateChanged } from '@angular/fire/auth';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { User as FirestoreUser } from '../interfaces/user.interface';
import { UserService } from './user.service';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  role?: 'admin' | 'user';
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private authInitialized = new BehaviorSubject<boolean>(false);
  public authInitialized$ = this.authInitialized.asObservable();

  constructor(
    private auth: Auth,
    private router: Router,
    private userService: UserService
  ) {
    // Monitora mudanças no estado de autenticação
    onAuthStateChanged(this.auth, async (user) => {
      console.log('🔄 Auth state changed:', user?.email || 'No user');
      
      if (user) {
        try {
          // Buscar dados do usuário no Firestore
          const firestoreUser = await this.userService.getUserByUid(user.uid);
          
          console.log('🔍 Dados do usuário no Firestore:', firestoreUser);
          
          const authUser: AuthUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
            role: firestoreUser?.role || 'user',
            isActive: firestoreUser?.isActive !== false
          };
          
          console.log('✅ AuthUser criado:', authUser);
          this.currentUserSubject.next(authUser);
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          // Em caso de erro, criar usuário básico
          const authUser: AuthUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
            role: 'user',
            isActive: true
          };
          this.currentUserSubject.next(authUser);
        }
      } else {
        console.log('❌ Usuário não autenticado');
        this.currentUserSubject.next(null);
      }
      
      // Marcar inicialização como completa
      if (!this.authInitialized.value) {
        console.log('✅ Auth inicializado');
        this.authInitialized.next(true);
      }
    });
  }

  // Login com email e senha
  async login(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // Salvar/atualizar dados do usuário no Firestore
      const firestoreUser = await this.userService.saveUserData(
        user.uid,
        user.email || email,
        user.displayName || undefined,
        user.photoURL || undefined
      );
      
      const authUser: AuthUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        role: firestoreUser.role,
        isActive: firestoreUser.isActive
      };

      console.log('✅ Login realizado com sucesso:', authUser);
      return authUser;
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      throw this.handleAuthError(error);
    }
  }

  // Registro de novo usuário
  async register(email: string, password: string, displayName?: string): Promise<AuthUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // Salvar dados do usuário no Firestore como usuário comum
      const firestoreUser = await this.userService.saveUserData(
        user.uid,
        user.email || email,
        displayName || user.displayName || undefined,
        user.photoURL || undefined
      );
      
      const authUser: AuthUser = {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName,
        emailVerified: user.emailVerified,
        role: firestoreUser.role, // Sempre será 'user' para auto-cadastro
        isActive: firestoreUser.isActive
      };

      console.log('✅ Usuário registrado e salvo no Firestore:', authUser);
      return authUser;
    } catch (error: any) {
      console.error('❌ Erro no registro:', error);
      throw this.handleAuthError(error);
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      console.log('✅ Logout realizado com sucesso');
      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('❌ Erro no logout:', error);
      throw error;
    }
  }

  // Verificar se está logado
  get isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  // Verificar se auth foi inicializado
  get isAuthInitialized(): boolean {
    return this.authInitialized.value;
  }

  // Aguardar inicialização da autenticação
  async waitForAuthInitialization(): Promise<void> {
    if (this.isAuthInitialized) {
      console.log('🚀 Auth já inicializado');
      return Promise.resolve();
    }

    console.log('⏳ Aguardando inicialização da autenticação...');
    
    return new Promise<void>((resolve, reject) => {
      // Timeout de 10 segundos para evitar travamento
      const timeout = setTimeout(() => {
        console.warn('⚠️ Timeout na inicialização da autenticação');
        resolve(); // Resolver mesmo com timeout para não travar a aplicação
      }, 10000);

      const subscription = this.authInitialized$.subscribe((initialized) => {
        if (initialized) {
          console.log('✅ Auth inicializado com sucesso');
          clearTimeout(timeout);
          subscription.unsubscribe();
          resolve();
        }
      });
    });
  }

  // Obter usuário atual
  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  // Verificar se é admin
  get isAdmin(): boolean {
    const user = this.currentUser;
    if (!user || !user.isActive) return false;
    
    // Usar role do Firestore como prioridade
    if (user.role === 'admin') {
      return true;
    }
    
    // Fallback: verificar por email (para compatibilidade)
    if (!user.email) return false;
    
    const adminEmails = ['admin@olgacolor.com', 'joao.morato@fingerdigital.com.br'];
    if (adminEmails.includes(user.email)) {
      return true;
    }
    
    if (user.email.includes('@fingerdigital.com.br')) {
      return true;
    }
    
    return false;
  }

  // Verificar se é usuário comum (autenticado mas não admin)
  get isUser(): boolean {
    const user = this.currentUser;
    if (!user || !user.isActive) return false;
    
    return user.role === 'user' && !this.isAdmin;
  }

  // Verificar se tem acesso a uma área específica
  hasAccess(requiredRoles: string[]): boolean {
    if (!this.isLoggedIn) return false;
    
    // Se não há roles especificadas, permitir acesso para usuários logados
    if (!requiredRoles || requiredRoles.length === 0) return true;
    
    // Verificar se permite usuários normais
    if (requiredRoles.includes('User') || requiredRoles.includes('user')) return true;
    
    // Verificar se requer admin e o usuário é admin
    if (requiredRoles.includes('Admin') || requiredRoles.includes('admin')) {
      return this.isAdmin;
    }
    
    return false;
  }

  // Tratamento de erros do Firebase
  private handleAuthError(error: any): Error {
    let message = 'Erro de autenticação';
    
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'Usuário não encontrado';
        break;
      case 'auth/wrong-password':
        message = 'Senha incorreta';
        break;
      case 'auth/email-already-in-use':
        message = 'Email já está em uso';
        break;
      case 'auth/weak-password':
        message = 'Senha muito fraca';
        break;
      case 'auth/invalid-email':
        message = 'Email inválido';
        break;
      case 'auth/too-many-requests':
        message = 'Muitas tentativas. Tente novamente mais tarde';
        break;
      default:
        message = error.message || 'Erro desconhecido';
    }
    
    return new Error(message);
  }
}
