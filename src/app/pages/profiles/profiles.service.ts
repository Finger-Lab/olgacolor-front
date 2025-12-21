import { inject, Injectable, signal } from '@angular/core';
import { collection, Firestore, collectionData } from '@angular/fire/firestore';
import { Storage, ref, getDownloadURL } from '@angular/fire/storage';
import { map, Observable, switchMap, from } from 'rxjs';
import { FilterParams, IProfile } from './profile.interface';



@Injectable({ providedIn: 'root' })
export class ProfilesService {

  public selectedProduct = signal<IProfile | null>(null);
  public categorySelected = signal<string | null>(null);

  private readonly _firestore = inject(Firestore);
  private readonly _storage = inject(Storage);

  find(params: FilterParams = {}): Observable<IProfile[]> {
    const profileRef = collection(this._firestore, 'profiles');

    return collectionData(profileRef, { idField: 'id' }).pipe(
      map((docs: any[]) => {
        let profiles = docs.map(doc => ({
          ...doc,
          name: String(doc.name || '')
        })) as IProfile[];

        // Aplicar filtro de busca
        if (params.search && params.search.trim()) {
          const searchTerm = params.search.toLowerCase().trim();
          profiles = profiles.filter(doc => {
            const docName = (doc.name || '').toLowerCase();
            // Se o termo de busca for exato, retorna apenas itens com nome exato
            if (searchTerm.length > 3) {
              return docName === searchTerm;
            }
            // Para termos curtos, usa busca parcial
            return docName.includes(searchTerm);
          });
        }

        // Aplicar filtro de categoria
        if (params.category && params.category.trim()) {
          // Mapeamento de categorias antigas/alternativas para categorias principais
          const categoryMapping: { [key: string]: string } = {
            'perfis tabelados': 'tabelados',
            'tabelados o': 'tabelados',
            'moveleiros': 'moveleira',
            'industrial': 'industriais'
          };
          
          let categoryTerm = params.category.toLowerCase().trim();
          
          // Se existe mapeamento, usar a categoria mapeada
          if (categoryMapping[categoryTerm]) {
            categoryTerm = categoryMapping[categoryTerm];
          }
          
          profiles = profiles.filter(doc =>
            doc.categories && doc.categories.some((cat: string) => {
              const catLower = cat.toLowerCase();
              // Verificar se a categoria do documento contém o termo OU se o termo contém palavras-chave da categoria
              return catLower.includes(categoryTerm) || categoryTerm.includes(catLower);
            })
          );
        }

        // Ordenar por name
        // profiles.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        return profiles;
      }),
      map((profiles) => this.processProfilesWithExistingUrls(profiles))
    );
  }

  private processProfilesWithExistingUrls(profiles: IProfile[]): IProfile[] {
    return profiles.map((profile) => {
      // Primeiro, verificar se já existe a propriedade 'images' populada
      if ((profile as any)['images'] && Array.isArray((profile as any)['images']) && (profile as any)['images'].length > 0) {
        return {
          ...profile,
          images: (profile as any)['images']
        };
      }

      const images: string[] = [];
      let coverUrl: string | null = null;
      let detailUrl: string | null = null;

      // Verifica se há URLs já definidas no perfil
      if ((profile as any)['coverImageUrl']) {
        coverUrl = (profile as any)['coverImageUrl'];
        if (coverUrl) {
          images.push(coverUrl);
        }
      }

      if ((profile as any)['detailImageUrl'] || (profile as any)['sidebarImageUrl']) {
        detailUrl = (profile as any)['detailImageUrl'] || (profile as any)['sidebarImageUrl'];
        if (detailUrl && detailUrl !== coverUrl) {
          images.push(detailUrl);
        }
      }

      // Se não há URL de detalhes, usa a de capa como fallback
      if (!detailUrl && coverUrl) {
        detailUrl = coverUrl;
      }

      // Se não há URLs no perfil, verifica se há outras propriedades de imagem
      if (images.length === 0) {
        // Verifica outras possíveis propriedades de imagem
        const possibleImageProps = ['imageUrl', 'image', 'photo', 'picture'];
        for (const prop of possibleImageProps) {
          if ((profile as any)[prop]) {
            const url = (profile as any)[prop];
            images.push(url);
            coverUrl = url;
            detailUrl = url;
            break;
          }
        }
      }
      
      return {
        ...profile,
        images,
        coverImageUrl: coverUrl,
        detailImageUrl: detailUrl
      };
    });
  }
}
