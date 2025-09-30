import { Component, inject, OnInit, signal, OnDestroy, effect, computed, PLATFORM_ID } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { catchError, of, take, debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { FinishesService } from '../../../pages/finishes/services/finishes.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';


@Component({
  selector: 'finishes-products',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class FinishesProductsComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>();
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  protected finishesService = inject(FinishesService);
  protected searchControl = new FormControl('');
  protected colors = signal<any[]>([]);
  protected isLoading = signal<boolean>(false);

  constructor() {
    effect(() => {
      this.onCategoryClick(this.finishesService.categorySelected() || '');
    });
  }

  ngOnInit(): void {
    this.setupSearchSubscription();
    this.loadData();

    // Verificar se há categoria nos query params na inicialização
    const categoryFromParams = this._route.snapshot.queryParams['category'];
    if (categoryFromParams) {
      this.onCategoryClick(categoryFromParams);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchSubscription(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.loadData(searchTerm || '', this.finishesService.categorySelected() || '');
    });
  }

  private loadData(searchTerm: string = '', category: string = ''): void {
    this.isLoading.set(true);
    const params = {
      search: searchTerm,
      category: category
    };

    this.finishesService.getAllPortfolio(params).pipe(
      take(1),
      catchError(_ => {
        this.isLoading.set(false);
        return of([]);
      })
    ).subscribe((items) => {
      this.colors.set(items);
      this.isLoading.set(false);
    });
  }

  protected setProduct(product: any): void {
    // Apenas definir o produto - o controle de scroll é feito no FinishesComponent
    this.finishesService.selectedProduct.set(product);
  }

  protected isProductSelected(product: any): boolean {
    const selectedProduct = this.finishesService.selectedProduct();
    return selectedProduct && selectedProduct.id === product.id;
  }

  protected onCategoryClick(categoryName: string): void {
    this.finishesService.categorySelected.set(categoryName);
    this._router.navigate(['/acabamentos', { outlets: { second: 'products' } }], { queryParams: { category: categoryName.toLowerCase() } })
    this.loadData(this.searchControl.value || '', categoryName);
  }

  protected clearFilters(): void {
    this.finishesService.categorySelected.set('');
    this.searchControl.setValue('');
    this.loadData();
  }

}
