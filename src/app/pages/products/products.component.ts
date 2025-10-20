import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ProfilesService } from '../profiles/profiles.service';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, take, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { IProfile } from '../profiles/profile.interface';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-products',
  standalone: true,
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
      this.profilesService.categorySelected.set(categoryFromParams);
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
    
    // Se não houver termo de busca, tenta pegar dos query params
    if (!searchTerm) {
      searchTerm = this._route.snapshot.queryParams['search'] || '';
    }

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
      // Define os perfis filtrados
      this.profiles.set(items);
      
      // Se houver apenas um item e vier de uma busca direta, seleciona-o
      if (items.length === 1 && searchTerm) {
        this.setProduct(items[0]);
      }
      
      this.isLoading.set(false);
    });
  }

  protected onCategoryClick(categoryName: string): void {
    this.profilesService.categorySelected.set(categoryName);
    this._router.navigate(['/perfis', { outlets: { second: 'products' } }], { queryParams: { category: categoryName } })
    this._loadData(this.searchControl.value || '', categoryName);
  }

  protected setProduct(product: any, event?: Event): void {
    this.profilesService.selectedProduct.set(product);
    
    // Posicionamento fixo - drawer sempre aparece na mesma posição abaixo do header
  }

  private getProfilesComponent(): any {
    // Buscar o componente ProfilesComponent através da árvore de componentes
    // Isso é uma solução temporária - idealmente usaríamos um serviço compartilhado
    return (window as any)?.profilesComponent;
  }

  protected clearFilters(): void {
    this.profilesService.categorySelected.set('');
    this.searchControl.setValue('');
    this._loadData();
  }

}
