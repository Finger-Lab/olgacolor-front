import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Storage, getStorage, ref, getDownloadURL, uploadBytes } from '@angular/fire/storage';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

interface Profile {
  id?: string;
  name: string;
  description: string;
  coverImageUrl?: string;
  sidebarImageUrl?: string;
}

@Component({
  selector: 'app-profile-images',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3>Imagens dos Perfis</h3>
        <a routerLink="/admin/perfis" class="btn btn-primary">
          Voltar para Perfis
        </a>
      </div>

      <div class="row">
        @for (profile of profiles$ | async; track profile.id) {
          <div class="col-md-4 mb-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">{{ profile.name }}</h5>
                <p class="card-text text-muted">{{ profile.description }}</p>
                
                @if (profile.coverImageUrl) {
                  <div class="mb-3">
                    <h6>Imagem de Capa</h6>
                    <img [src]="profile.coverImageUrl" 
                         class="img-fluid img-thumbnail" 
                         [alt]="'Imagem de capa - ' + profile.name">
                  </div>
                }

                @if (profile.sidebarImageUrl) {
                  <div>
                    <h6>Imagem do Sidebar</h6>
                    <img [src]="profile.sidebarImageUrl" 
                         class="img-fluid img-thumbnail" 
                         [alt]="'Imagem do sidebar - ' + profile.name">
                  </div>
                }

                <div class="mt-3">
                  @if (profile.coverImageUrl) {
                    <a [href]="profile.coverImageUrl" 
                       target="_blank" 
                       class="btn btn-sm btn-outline-primary me-2">
                      Ver Imagem de Capa
                    </a>
                  }
                  @if (profile.sidebarImageUrl) {
                    <a [href]="profile.sidebarImageUrl" 
                       target="_blank" 
                       class="btn btn-sm btn-outline-primary">
                      Ver Imagem do Sidebar
                    </a>
                  }
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .card img {
      max-height: 200px;
      object-fit: contain;
      width: 100%;
    }
    .card {
      height: 100%;
    }
  `]
})
export class ProfileImagesComponent implements OnInit {
  private readonly storage = inject(Storage);
  private readonly firestore = inject(Firestore);
  
  profiles$: Observable<Profile[]>;

  constructor() {
    const profilesCollection = collection(this.firestore, 'profiles');
    
    this.profiles$ = collectionData(profilesCollection, { idField: 'id' }).pipe(
      map(profiles => profiles as Profile[]),
      mergeMap(async profiles => {
        const loadedProfiles: Profile[] = [];
        
        for (const profile of profiles) {
          try {
            // Tenta carregar a imagem de capa
            try {
              const coverRef = ref(this.storage, `profiles1/${profile.name}_1.png`);
              profile.coverImageUrl = await getDownloadURL(coverRef);
            } catch (error) {
              console.warn(`Imagem de capa não encontrada para ${profile.name}`);
            }

            // Aguarda um pouco antes de tentar a próxima imagem
            await new Promise(resolve => setTimeout(resolve, 100));

            // Tenta carregar a imagem do sidebar
            try {
              const sidebarRef = ref(this.storage, `profiles1/${profile.name}_2.png`);
              profile.sidebarImageUrl = await getDownloadURL(sidebarRef);
            } catch (error) {
              console.warn(`Imagem do sidebar não encontrada para ${profile.name}`);
            }

            loadedProfiles.push(profile);
          } catch (error) {
            console.error(`Erro ao processar perfil ${profile.name}:`, error);
          }

          // Aguarda um pouco antes de processar o próximo perfil
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        return loadedProfiles;
      })
    );
  }

  ngOnInit(): void {}

  private getProfilesCount(): Observable<number> {
    const profilesCollection = collection(this.firestore, 'profiles');
    return collectionData(profilesCollection).pipe(
      map(profiles => profiles.length)
    );
  }

  async onFileSelected(event: any): Promise<void> {
    const file = event.target.files[0] as File;
    if (!file) return;

    const filename = await firstValueFrom(this.getProfilesCount().pipe(
      map(count => `profile_${count + 1}.png`)
    ));

    await this.uploadFile(file, filename);
  }

  private async uploadFile(file: File, filename: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, `profiles1/${filename}`);
      const result = await uploadBytes(storageRef, file);
      console.log('File uploaded successfully:', result);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
}