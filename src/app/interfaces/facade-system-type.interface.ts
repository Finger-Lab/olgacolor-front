export interface FacadeSystemType {
  id?: string;
  name: string;
  displayName?: string; // Nome para exibição (pode ser diferente do nome técnico)
  logoUrl?: string;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateFacadeSystemTypeRequest {
  name: string;
  displayName?: string;
  description?: string;
  isActive: boolean;
}

export interface UpdateFacadeSystemTypeRequest {
  name?: string;
  displayName?: string;
  description?: string;
  isActive?: boolean;
}