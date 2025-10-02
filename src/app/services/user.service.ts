import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  setDoc,
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  orderBy,
  where,
  writeBatch
} from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword, UserCredential } from '@angular/fire/auth';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { User, UserCreateRequest, UserUpdateRequest } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersCollection: any;
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {
    // Inicializar coleção
    this.usersCollection = collection(this.firestore, 'users');
    // Carregar usuários ao inicializar o serviço
    this.loadUsers();
  }

  // Carregar todos os usuários
  async loadUsers(): Promise<void> {
    try {
      const q = query(this.usersCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as any;
        users.push({
          uid: doc.id,
          email: data['email'],
          displayName: data['displayName'] || '',
          role: data['role'] || 'user',
          createdAt: data['createdAt']?.toDate() || new Date(),
          updatedAt: data['updatedAt']?.toDate() || new Date(),
          photoURL: data['photoURL'] || '',
          isActive: data['isActive'] !== false
        });
      });
      
      this.usersSubject.next(users);
      console.log('✅ Usuários carregados:', users.length);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      throw error;
    }
  }

  // Buscar usuário por UID
  async getUserByUid(uid: string): Promise<User | null> {
    try {
      const userDoc = doc(this.firestore, 'users', uid);
      const docSnap = await getDoc(userDoc);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        return {
          uid: docSnap.id,
          email: data['email'],
          displayName: data['displayName'] || '',
          role: data['role'] || 'user',
          createdAt: data['createdAt']?.toDate() || new Date(),
          updatedAt: data['updatedAt']?.toDate() || new Date(),
          photoURL: data['photoURL'] || '',
          isActive: data['isActive'] !== false
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }

  // Buscar usuário por email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const q = query(this.usersCollection, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data() as any;
        return {
          uid: doc.id,
          email: data['email'],
          displayName: data['displayName'] || '',
          role: data['role'] || 'user',
          createdAt: data['createdAt']?.toDate() || new Date(),
          updatedAt: data['updatedAt']?.toDate() || new Date(),
          photoURL: data['photoURL'] || '',
          isActive: data['isActive'] !== false
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      throw error;
    }
  }

  // Criar novo usuário
  async createUser(userData: UserCreateRequest): Promise<User> {
    try {
      // Criar usuário no Authentication
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        this.auth, 
        userData.email, 
        userData.password
      );

      // Criar documento no Firestore
      const userDoc = {
        uid: userCredential.user.uid,
        email: userData.email,
        displayName: userData.displayName || '',
        role: userData.role,
        createdAt: new Date(),
        updatedAt: new Date(),
        photoURL: '',
        isActive: true
      };

      // Usar o UID do Authentication como ID do documento
      const userDocRef = doc(this.firestore, 'users', userCredential.user.uid);
      await setDoc(userDocRef, userDoc);

      const newUser: User = {
        ...userDoc
      };

      // Atualizar lista local
      this.loadUsers();

      return newUser;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  // Atualizar usuário
  async updateUser(uid: string, userData: UserUpdateRequest): Promise<void> {
    try {
      const userDoc = doc(this.firestore, 'users', uid);
      const updateData = {
        ...userData,
        updatedAt: new Date()
      };
      
      await updateDoc(userDoc, updateData);
      
      // Atualizar lista local
      this.loadUsers();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  // Desativar usuário (soft delete)
  async deactivateUser(uid: string): Promise<void> {
    try {
      await this.updateUser(uid, { isActive: false });
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      throw error;
    }
  }

  // Ativar usuário
  async activateUser(uid: string): Promise<void> {
    try {
      await this.updateUser(uid, { isActive: true });
    } catch (error) {
      console.error('Erro ao ativar usuário:', error);
      throw error;
    }
  }

  // Alternar role do usuário entre admin e user
  async toggleUserRole(uid: string): Promise<void> {
    try {
      const user = await this.getUserByUid(uid);
      if (user) {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        await this.updateUser(uid, { role: newRole });
        console.log(`✅ Role do usuário ${user.email} alterado para: ${newRole}`);
      }
    } catch (error) {
      console.error('Erro ao alternar role do usuário:', error);
      throw error;
    }
  }

  // Alternar status do usuário
  async toggleUserStatus(uid: string): Promise<void> {
    try {
      const user = await this.getUserByUid(uid);
      if (user) {
        const newStatus = !user.isActive;
        await this.updateUser(uid, { isActive: newStatus });
        console.log(`✅ Status do usuário ${user.email} alterado para: ${newStatus ? 'ativo' : 'inativo'}`);
      }
    } catch (error) {
      console.error('Erro ao alternar status do usuário:', error);
      throw error;
    }
  }

  // Excluir usuário permanentemente
  async deleteUser(uid: string): Promise<void> {
    try {
      const userDoc = doc(this.firestore, 'users', uid);
      await deleteDoc(userDoc);
      
      // Atualizar lista local
      this.loadUsers();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  }

  // Salvar dados do usuário após login
  async saveUserData(uid: string, email: string, displayName?: string, photoURL?: string): Promise<User> {
    try {
      const existingUser = await this.getUserByUid(uid);
      
      if (existingUser) {
        // Usuário já existe - apenas retornar os dados existentes sem atualizar
        console.log('✅ Usuário existente encontrado:', existingUser.email);
        return existingUser;
      } else {
        // Usuário não existe - criar novo com role padrão 'user'
        const newUserData = {
          email,
          displayName: displayName || '',
          role: 'user' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          photoURL: photoURL || '',
          isActive: true
        };
        
        const userDoc = doc(this.firestore, 'users', uid);
        await setDoc(userDoc, newUserData);
        
        const newUser: User = {
          uid,
          ...newUserData
        };
        
        // Atualizar lista local
        this.loadUsers();
        
        console.log('✅ Novo usuário criado:', newUser.email);
        return newUser;
      }
    } catch (error) {
      console.error('Erro ao salvar dados do usuário:', error);
      throw error;
    }
  }
}