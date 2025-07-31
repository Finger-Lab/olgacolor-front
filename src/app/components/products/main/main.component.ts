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
    })
  }

  ngOnInit(): void {
    this.onCategorySelect(this.route.snapshot.queryParams['category']);
    this._getProducts();
    this._setSearchObservable();
  }

  private _getProducts(): void {
    this._productsService.getProducts().subscribe((products: any) => {
      this._products = products;
      this.productsFiltered.set(
        [products[0], products[1], products[2], products[3], products[4], products[5], products[6], products[7], products[8], products[9]]
      );

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
