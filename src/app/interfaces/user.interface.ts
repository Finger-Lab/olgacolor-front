export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
  photoURL?: string;
  isActive: boolean;
}

export interface UserCreateRequest {
  email: string;
  displayName?: string;
  role: 'admin' | 'user';
  password: string;
}

export interface UserUpdateRequest {
  displayName?: string;
  role?: 'admin' | 'user';
  isActive?: boolean;
}