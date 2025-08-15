import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ProductsService } from '../../../services/products.service';

@Component({
  selector: 'app-main',
  imports: [RouterLink],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  private router = inject(Router);
  private _productsService = inject(ProductsService);

  protected onPerfilClick(category: string) {
    this._productsService.categorySelected.set(category);
    this.router.navigate(['/produtos'], { queryParams: { category: category.toUpperCase() } })
  }
}
