import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ProductsService } from '../../../services/products.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-main',
  imports: [
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {

  private _products: any[] = [];
  private _productsService = inject(ProductsService);
  private _router = inject(Router);

  protected route = inject(ActivatedRoute);
  protected categories = signal<any[]>([]);
  protected searchTerm = new FormControl<string>('');
  protected productSelected = signal<any>(null);
  protected productsFiltered = signal<any[]>([]);

  constructor() {
    effect(() => {
      if (this._productsService.productSelected())
        this.productSelected.set(this._productsService.productSelected());
    });

    effect(() => {
      if (this._productsService.categorySelected())
        this.onCategorySelect(this._productsService.categorySelected() || '');
    });
  }

  ngOnInit(): void {
    this.onCategorySelect(this.route.snapshot.queryParams['category']);
    this._getProducts();
    this._setSearchObservable();
  }

  private _getProducts(): void {
    console.log('🚀 Chamando _getProducts() no MainComponent');
    this._productsService.getProducts().subscribe(async (products: any) => {
      console.log('📥 Produtos recebidos no componente:', products);
      
      this._products = products;
      this.productsFiltered.set(products);

      const mainCategorySet = new Set<string>();

      for (const product of products) {
        const paths = product.category.split(/,|>/);
        const mainCategory = paths[0].toUpperCase().trim();

        if (!mainCategorySet.has(mainCategory)) {
          mainCategorySet.add(mainCategory);
          this.categories.update((curr: any[]) => {
            curr.push({ mainCategory });
            return curr;
          });
        }
      }

      if (this.route.snapshot.queryParams['category']) {
        this._productsService.categorySelected.set(this.route.snapshot.queryParams['category']);
      }

      // Carrega as imagens dos produtos após receber os dados
      try {
        console.log('🔄 Iniciando carregamento de imagens no componente...');
        const productsWithImages = await this._productsService.loadAllProductImages(products);
        this._products = productsWithImages;
        this.productsFiltered.set(productsWithImages);
        console.log('✅ Imagens carregadas e produtos atualizados');
      } catch (error) {
        console.error('❌ Erro ao carregar imagens:', error);
      }
    });
  }

  private _setSearchObservable(): void {
    this.searchTerm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this._onSearch())
  }

  private _onSearch(): void {
    this.productsFiltered.set(
      this._products.filter((product: any) => product.name.toLowerCase().includes(this.searchTerm.value?.toLowerCase() || ''))
    );
  }

  protected onCategorySelect(category: string): void {
    this.productSelected.set(null);
    this.productsFiltered.set(
      this._products.filter((product: any) => product.category.toLowerCase().includes(category.toLowerCase()))
    );
    this._router.navigate(['/produtos'], { queryParams: { category: category?.toUpperCase() } })
  }

  onProductClick(product: any) {
    this.productSelected.set(product);

    if (window.innerWidth < 992) {
      const element = document.getElementsByClassName('product-details')[0] as HTMLElement
      window.scrollTo({
        top: element.offsetTop + 100,
        behavior: 'smooth'
      })
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

}
