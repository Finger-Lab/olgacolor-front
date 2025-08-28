import { inject, Injectable, signal } from '@angular/core';
import { collection, Firestore, getDocs } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { FilterParams, IProfile } from './profile.interface';



@Injectable({ providedIn: 'root' })
export class ProfilesService {

  public selectedProduct = signal<IProfile | null>(null);
  public categorySelected = signal<string | null>(null);

  private readonly _firestore = inject(Firestore);

  find(params: FilterParams = {}): Observable<IProfile[]> {
    const profileRef = collection(this._firestore, 'profiles');

    return from(getDocs(profileRef).then(snapshot => {
      let docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as IProfile[];

      docs = docs.map(doc => ({
        ...doc,
        name: String(doc.name || '')
      }));

      // Aplicar filtro de busca
      if (params.search && params.search.trim()) {
        const searchTerm = params.search.toLowerCase().trim();
        docs = docs.filter(doc => {
          return doc.name?.toLowerCase().includes(searchTerm);
        });
      }

      // Aplicar filtro de categoria
      if (params.category && params.category.trim()) {
        const categoryTerm = params.category.toLowerCase().trim();
        docs = docs.filter(doc =>
          doc.categories && doc.categories.some(cat =>
            cat.toLowerCase().includes(categoryTerm)
          )
        );
      }

      // Ordenar por name
      // docs.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      return docs;
    }));
  }

}
