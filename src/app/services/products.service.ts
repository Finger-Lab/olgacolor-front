import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Storage, ref, getDownloadURL } from '@angular/fire/storage';

@Injectable({ providedIn: 'root' })
export class ProductsService {

  private readonly _http = inject(HttpClient);
  private readonly _storage = inject(Storage);
  private readonly _url = `${environment.apiUrl}/api`;

  // Signals para gerenciar estado
  productSelected = signal<any>(null);
  categorySelected = signal<string>('');

  getProducts(): Observable<any[]> {
    console.log('🔍 Iniciando busca de produtos...');
    
    return this._http.get<any[]>(`${this._url}/products`).pipe(
      switchMap((products: any[]) => {
        console.log(`📦 Produtos recebidos da API: ${products.length}`, products);
        
        // Retorna os produtos imediatamente sem carregar imagens por enquanto
        return from([products]);
      })
    );
  }

  async loadProductImage(product: any, imageType: 'cover' | 'detail'): Promise<string | null> {
    try {
      const suffix = imageType === 'cover' ? '_1.png' : '_2.png';
      const imageRef = ref(this._storage, `profiles1/${product.name}${suffix}`);
      const url = await getDownloadURL(imageRef);
      console.log(`✓ Imagem ${imageType} carregada para ${product.name}:`, url);
      return url;
    } catch (error) {
      console.warn(`⚠️ Imagem ${imageType} não encontrada para ${product.name}`, error);
      return null;
    }
  }

  async loadAllProductImages(products: any[]): Promise<any[]> {
    console.log('🖼️ Iniciando carregamento de imagens...');
    
    for (const product of products) {
      console.log(`🔄 Processando produto: ${product.name}`);
      
      // Carrega imagem de capa
      const coverUrl = await this.loadProductImage(product, 'cover');
      if (coverUrl) {
        product.image_small = coverUrl;
        product.coverImageUrl = coverUrl;
      }

      // Aguarda um pouco
      await new Promise(resolve => setTimeout(resolve, 100));

      // Carrega imagem de detalhes
      const detailUrl = await this.loadProductImage(product, 'detail');
      if (detailUrl) {
        product.image_big = detailUrl;
        product.detailImageUrl = detailUrl;
      } else {
        // Fallback para imagem de capa
        product.image_big = product.image_small;
        product.detailImageUrl = product.image_small;
        console.log(`→ Usando imagem de capa como fallback para ${product.name}`);
      }

      console.log(`✅ Produto processado: ${product.name}`, {
        image_small: product.image_small,
        image_big: product.image_big
      });

      // Aguarda antes do próximo produto
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`🎉 Carregamento concluído. Total de produtos: ${products.length}`);
    return products;
  }

}
