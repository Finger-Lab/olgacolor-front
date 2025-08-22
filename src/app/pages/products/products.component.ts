import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ProfilesService } from '../profiles/profiles.service';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, take, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { IProfile } from '../profiles/profile.interface';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-products',
  imports: [
    UpperCasePipe,
    ReactiveFormsModule
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>();
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  protected isLoading = signal<boolean>(false);
  protected searchControl = new FormControl('');
  protected profilesService = inject(ProfilesService);
  protected profiles = signal<IProfile[]>([]);

  constructor() {
    effect(() => {
      this.onCategoryClick(this.profilesService.categorySelected() || '');
    });
  }

  ngOnInit(): void {
    this._setupSearchSubscription();
    this._loadData();

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

  private _setupSearchSubscription(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this._loadData(searchTerm || '', this.profilesService.categorySelected() || '');
    });
  }

  private _loadData(searchTerm: string = '', category: string = ''): void {
    this.isLoading.set(true);
    const params = {
      search: searchTerm,
      category: category
    };

    this.profilesService.find(params).pipe(
      take(1),
      catchError(error => {
        console.log('error', error);
        this.isLoading.set(false);
        return of([]);
      })
    ).subscribe((items) => {
      this.profiles.set(items);
      this.isLoading.set(false);
    });
  }

  protected onCategoryClick(categoryName: string): void {
    this.profilesService.categorySelected.set(categoryName);
    this._router.navigate(['/perfis', { outlets: { second: 'products' } }], { queryParams: { category: categoryName } })
    this._loadData(this.searchControl.value || '', categoryName);
  }

  protected setProduct(product: any): void {
    this.profilesService.selectedProduct.set(product);
  }

  protected clearFilters(): void {
    this.profilesService.categorySelected.set('');
    this.searchControl.setValue('');
    this._loadData();
  }

}
