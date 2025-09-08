import { Component, OnInit, OnDestroy, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, catchError, of, take } from 'rxjs';
import { CatalogsService } from '../catalogs.service';
import { ICatalog } from '../catalog.interface';

@Component({
  selector: 'app-catalog-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './catalog-products.component.html',
  styleUrls: ['./catalog-products.component.scss']
})
export class CatalogProductsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  protected isLoading = signal<boolean>(false);
  protected searchControl = new FormControl('');
  protected catalogsService = inject(CatalogsService);
  protected catalogs = signal<ICatalog[]>([]);

  constructor() {
    effect(() => {
      this.onCategoryClick(this.catalogsService.categorySelected() || '');
    });
  }

  ngOnInit(): void {
    this._setupSearchSubscription();
    
    // Subscribe to filtered catalogs
    this.catalogsService.catalogs$
      .pipe(takeUntil(this.destroy$))
      .subscribe(filteredCatalogs => {
        this.catalogs.set(filteredCatalogs);
      });

    // Carregar dados iniciais
    this._loadData();

    // Verificar se há parâmetros na URL
    const params = this._route.snapshot.queryParams;
    const searchFromParams = params['search'];
    const categoryFromParams = params['category'];

    // Se houver termo de busca, atualiza o campo de busca
    if (searchFromParams) {
      this.searchControl.setValue(searchFromParams, { emitEvent: false });
    }

    // Carrega os dados com os filtros da URL
    this._loadData(searchFromParams || '', categoryFromParams || '');

    // Se houver categoria, atualiza a seleção
    if (categoryFromParams) {
      this.catalogsService.categorySelected.set(categoryFromParams);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private _setupSearchSubscription(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this._loadData(searchTerm || '', this.catalogsService.categorySelected() || '');
    });
  }

  private _loadData(searchTerm: string = '', category: string = ''): void {
    this.isLoading.set(true);
    
    const params = {
      search: searchTerm,
      category: category
    };

    console.log('Loading data with params:', params); // Para debug

    this.catalogsService.find(params).pipe(
      take(1),
      catchError(error => {
        console.error('Error loading catalogs:', error);
        this.isLoading.set(false);
        return of([]);
      })
    ).subscribe((items) => {
      console.log('Received items:', items); // Para debug
      this.catalogs.set(items);
      this.isLoading.set(false);
    });
  }

  protected onCategoryClick(categoryName: string): void {
    this.catalogsService.categorySelected.set(categoryName);
    this._router.navigate(['/catalogos', { outlets: { second: 'products' } }], { 
      queryParams: { category: categoryName }
    });
    this._loadData(this.searchControl.value || '', categoryName);
  }

  protected clearFilters(): void {
    this.catalogsService.categorySelected.set('');
    this.searchControl.setValue('');
    this._loadData();
  }

  protected openPdf(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }
}
