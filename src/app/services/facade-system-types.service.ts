import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, query, orderBy } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FacadeSystemType, CreateFacadeSystemTypeRequest, UpdateFacadeSystemTypeRequest } from '../interfaces/facade-system-type.interface';

@Injectable({
  providedIn: 'root'
})
export class FacadeSystemTypesService {
  private readonly collectionName = 'facadeSystemTypes';

  constructor(
    private firestore: Firestore,
    private storage: Storage
  ) {}

  // Obter todos os tipos de sistemas
  getFacadeSystemTypes(): Observable<FacadeSystemType[]> {
    const typesRef = collection(this.firestore, this.collectionName);
    const typesQuery = query(typesRef, orderBy('name'));
    
    return collectionData(typesQuery, { idField: 'id' }).pipe(
      map((data: any[]) => {
        console.log('🎯 Carregando tipos de sistemas:', data?.length);
        return data.map(item => ({
          ...item,
          createdAt: item.createdAt?.toDate?.() || new Date(),
          updatedAt: item.updatedAt?.toDate?.() || new Date()
        }));
      })
    );
  }

  // Obter apenas tipos ativos
  getActiveFacadeSystemTypes(): Observable<FacadeSystemType[]> {
    return this.getFacadeSystemTypes().pipe(
      map(types => types.filter(type => type.isActive))
    );
  }

  // Criar novo tipo de sistema
  async createFacadeSystemType(request: CreateFacadeSystemTypeRequest): Promise<void> {
    const typesRef = collection(this.firestore, this.collectionName);
    
    const newType: Omit<FacadeSystemType, 'id'> = {
      name: request.name.trim(),
      displayName: request.displayName?.trim() || request.name.trim(),
      description: request.description?.trim() || '',
      isActive: request.isActive,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await addDoc(typesRef, newType);
    console.log('✅ Tipo de sistema criado:', newType.name);
  }

  // Atualizar tipo de sistema
  async updateFacadeSystemType(id: string, request: UpdateFacadeSystemTypeRequest): Promise<void> {
    const typeDocRef = doc(this.firestore, this.collectionName, id);
    
    const updateData: any = {
      updatedAt: new Date()
    };

    if (request.name !== undefined) updateData.name = request.name.trim();
    if (request.displayName !== undefined) updateData.displayName = request.displayName.trim();
    if (request.description !== undefined) updateData.description = request.description.trim();
    if (request.isActive !== undefined) updateData.isActive = request.isActive;

    await updateDoc(typeDocRef, updateData);
    console.log('✅ Tipo de sistema atualizado:', id);
  }

  // Deletar tipo de sistema
  async deleteFacadeSystemType(id: string): Promise<void> {
    const typeDocRef = doc(this.firestore, this.collectionName, id);
    await deleteDoc(typeDocRef);
    console.log('✅ Tipo de sistema deletado:', id);
  }

  // Upload de logo para tipo de sistema
  async uploadLogo(file: File, systemTypeId: string): Promise<string> {
    const fileName = `${new Date().getTime()}_${file.name}`;
    const storageRef = ref(this.storage, `system-types/${systemTypeId}/${fileName}`);
    
    console.log('🔄 Fazendo upload do logo:', fileName);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Atualizar o documento com a URL do logo
    const typeDocRef = doc(this.firestore, this.collectionName, systemTypeId);
    await updateDoc(typeDocRef, { 
      logoUrl: downloadURL,
      updatedAt: new Date()
    });
    
    console.log('✅ Logo uploaded e atualizado:', downloadURL);
    return downloadURL;
  }

  // Deletar logo do tipo de sistema
  async deleteLogo(systemTypeId: string, logoUrl: string): Promise<void> {
    try {
      // Extrair o caminho do arquivo da URL
      const urlParts = logoUrl.split('/');
      const encodedPath = urlParts[urlParts.length - 1].split('?')[0];
      const filePath = decodeURIComponent(encodedPath);
      
      // Deletar arquivo do Storage
      const storageRef = ref(this.storage, filePath);
      await deleteObject(storageRef);
      
      // Remover URL do documento
      const typeDocRef = doc(this.firestore, this.collectionName, systemTypeId);
      await updateDoc(typeDocRef, { 
        logoUrl: null,
        updatedAt: new Date()
      });
      
      console.log('✅ Logo deletado do Storage e documento atualizado');
    } catch (error) {
      console.error('❌ Erro ao deletar logo:', error);
      throw error;
    }
  }

  // Inicializar tipos padrão (executar uma vez para popular o banco)
  async initializeDefaultSystemTypes(): Promise<void> {
    const defaultSystems = [
      'AGLO 2.0',
      'AGLO 2.2 OC',
      'AGLO 2.5 OC',
      'AGLO 3.2 OC',
      'Colato',
      'Lock/s',
      'Lock/sl',
      'Lock/ SL Colato',
      'Lock/HD',
      'Lock/CL',
      'Lock/L',
      'Grid',
      'UniK',
      'Neograd',
      'Delicato',
      'Delicato 2',
      'Delicato 3',
      'Levitare',
      'Imponenza',
      'Stick',
      'Evo Stick',
      'LineaGlass',
      'Slide Glass',
      'Olglass',
      'Gradiluk',
      'Olga Sierra'
    ];

    for (const systemName of defaultSystems) {
      await this.createFacadeSystemType({
        name: systemName,
        displayName: systemName,
        isActive: true
      });
    }

    console.log('✅ Tipos de sistemas padrão inicializados');
  }
}