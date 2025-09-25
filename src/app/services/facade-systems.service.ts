import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface FacadeSystem {
  id?: string;
  title: string;
  location: string;
  system: string;
  constructor: string;
  imageUrl?: string;
}

import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class FacadeSystemsService {
  constructor(
    private firestore: Firestore,
    private storage: Storage
  ) {}

  async uploadImage(file: File): Promise<string> {
    const storageRef = ref(this.storage, `obras/${new Date().getTime()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  getFacadeSystems(): Observable<FacadeSystem[]> {
    const facadesRef = collection(this.firestore, 'facadeSystems');
    return collectionData(facadesRef, { idField: 'id' }) as Observable<FacadeSystem[]>;
  }

  async createFacadeSystem(facade: Omit<FacadeSystem, 'id'>): Promise<void> {
    const facadesRef = collection(this.firestore, 'facadeSystems');
    await addDoc(facadesRef, facade);
  }

  async updateFacadeSystem(id: string, facade: Partial<FacadeSystem>): Promise<void> {
    const facadeDocRef = doc(this.firestore, 'facadeSystems', id);
    await updateDoc(facadeDocRef, facade);
  }

  async deleteFacadeSystem(id: string): Promise<void> {
    const facadeDocRef = doc(this.firestore, 'facadeSystems', id);
    await deleteDoc(facadeDocRef);
  }
}