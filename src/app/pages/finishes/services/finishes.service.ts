import { inject, Injectable, signal } from '@angular/core';
import { Firestore, collection, getDocs, doc, getDoc, getCountFromServer, query, orderBy, limit, startAfter, where } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';

interface PaginationParams {
  pageSize: number;
  page: number;
  search?: string;
  category?: string;
}

interface FilterParams {
  search?: string;
  category?: string;
}

interface PortfolioItem {
  id: string;
  titulo?: string;
  slug?: string;
  imagem?: string;
  categorias?: string[];
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class FinishesService {

  public selectedProduct = signal<any>(null);
  public categorySelected = signal<string | null>(null);

  private readonly _firestore = inject(Firestore);

  getAllPortfolio(params: FilterParams = {}): Observable<any[]> {
    const portfolioRef = collection(this._firestore, 'portfolio');

    return from(getDocs(portfolioRef).then(snapshot => {
      let docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PortfolioItem[];

      // Aplicar filtro de busca
      if (params.search && params.search.trim()) {
        const searchTerm = params.search.toLowerCase().trim();
        docs = docs.filter(doc =>
          doc.titulo && doc.titulo.toLowerCase().includes(searchTerm)
        );
      }

      // Aplicar filtro de categoria
      if (params.category && params.category.trim()) {
        const categoryTerm = params.category.toLowerCase().trim();
        docs = docs.filter(doc =>
          doc.categorias && doc.categorias.some(cat =>
            cat.toLowerCase().includes(categoryTerm)
          )
        );
      }

      // Ordenar por slug
      docs.sort((a, b) => (a.slug || '').localeCompare(b.slug || ''));

      return docs;
    }));
  }

  getPortfolio(params: PaginationParams = { pageSize: 12, page: 0 }): Observable<any[]> {
    const portfolioRef = collection(this._firestore, 'portfolio');

    // Se há busca ou categoria, buscar todos os documentos e filtrar
    if ((params.search && params.search.trim()) || (params.category && params.category.trim())) {
      return from(getDocs(portfolioRef).then(snapshot => {
        let docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PortfolioItem[];

        // Aplicar filtro de busca
        if (params.search && params.search.trim()) {
          const searchTerm = params.search.toLowerCase().trim();
          docs = docs.filter(doc =>
            doc.titulo && doc.titulo.toLowerCase().includes(searchTerm)
          );
        }

        // Aplicar filtro de categoria
        if (params.category && params.category.trim()) {
          const categoryTerm = params.category.toLowerCase().trim();
          docs = docs.filter(doc =>
            doc.categorias && doc.categorias.some(cat =>
              cat.toLowerCase().includes(categoryTerm)
            )
          );
        }

        // Ordenar por slug
        docs.sort((a, b) => (a.slug || '').localeCompare(b.slug || ''));

        // Aplicar paginação
        const startIndex = params.page * params.pageSize;
        const endIndex = startIndex + params.pageSize;
        return docs.slice(startIndex, endIndex);
      }));
    }

    // Sem busca, usar paginação normal do Firestore
    const startIndex = params.page * params.pageSize;
    let q = query(portfolioRef, orderBy('slug', 'asc'), limit(params.pageSize));

    if (startIndex > 0) {
      // Primeiro, precisamos buscar o documento de referência
      return from(this.getReferenceDocument(portfolioRef, startIndex).then(lastDoc => {
        if (lastDoc) {
          q = query(portfolioRef, orderBy('slug', 'asc'), startAfter(lastDoc), limit(params.pageSize));
        }
        return getDocs(q).then(snapshot =>
          snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as PortfolioItem[]
        );
      }));
    }

    return from(getDocs(q).then(snapshot =>
      snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PortfolioItem[]
    ));
  }

  private async getReferenceDocument(collectionRef: any, startIndex: number): Promise<any> {
    const q = query(collectionRef, orderBy('slug', 'asc'), limit(startIndex));
    const snapshot = await getDocs(q);
    return snapshot.docs[snapshot.docs.length - 1];
  }

  getPortfolioById(id: string): Observable<any> {
    const portfolioRef = doc(this._firestore, 'portfolio', id);
    return from(getDoc(portfolioRef).then(doc => {
      if (doc.exists()) {
        return {
          id: doc.id,
          ...doc.data()
        };
      }
      return null;
    }));
  }

  getCustomPortfolio(): Observable<any> {
    const portfolioRef = collection(this._firestore, 'portfolio');
    return from(getDocs(portfolioRef).then(snapshot => {
      if (!snapshot.empty) {
        const firstDoc = snapshot.docs[0];
        const secondDoc = snapshot.docs[1];
        return [
          { id: firstDoc.id, ...firstDoc.data() },
          { id: secondDoc.id, ...secondDoc.data() }
        ];
      }
      return null;
    }));
  }

  getPortfolioCount(search?: string, category?: string): Observable<number> {
    const portfolioRef = collection(this._firestore, 'portfolio');

    if ((search && search.trim()) || (category && category.trim())) {
      // Se há busca ou categoria, precisamos contar os itens filtrados
      return from(getDocs(portfolioRef).then(snapshot => {
        let docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PortfolioItem[];

        // Aplicar filtro de busca
        if (search && search.trim()) {
          const searchTerm = search.toLowerCase().trim();
          docs = docs.filter(doc =>
            doc.titulo && doc.titulo.toLowerCase().includes(searchTerm)
          );
        }

        // Aplicar filtro de categoria
        if (category && category.trim()) {
          const categoryTerm = category.toLowerCase().trim();
          docs = docs.filter(doc =>
            doc.categorias && doc.categorias.some(cat =>
              cat.toLowerCase().includes(categoryTerm)
            )
          );
        }

        return docs.length;
      }));
    }

    return from(getCountFromServer(portfolioRef).then(snapshot => snapshot.data().count));
  }

}
