import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProductsService } from '../../../services/products.service';
import { FinishesService } from '../../../pages/finishes/services/finishes.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

  private router = inject(Router);
  private _productsService = inject(ProductsService);
  private _finishesService = inject(FinishesService);

  protected onTodosClick(): void {
    // Clear any previously selected category so products page shows all products
    this._productsService.categorySelected.set(null);
    this.router.navigate(['/perfis', { outlets: { second: 'products' } }]);
  }

  protected onCategoryClick(category: string): void {
    this._productsService.categorySelected.set(category);
    this.router.navigate(['/perfis', { outlets: { second: 'products' } }], { queryParams: { category: category } });
  }

  protected onFinishesClick(category: string): void {
    this._finishesService.categorySelected.set(category);
    this.router.navigate(['/acabamentos', { outlets: { second: 'products' } }], { queryParams: { category: category.toLowerCase() } });
  }

}
