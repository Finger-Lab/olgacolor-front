import { AsyncPipe, NgClass } from '@angular/common';
import { Component, HostListener, ChangeDetectorRef, input, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { ProductsService } from '../../services/products.service';
import { Profile } from '../../interfaces/profile.interface';
import { FinishesService } from '../../pages/finishes/services/finishes.service';

@Component({
  selector: 'app-header',
  imports: [
    AsyncPipe,
    RouterLink,
    NgClass,
    ReactiveFormsModule,
    MatAutocompleteModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  public customClass = input<string>('');

  private _profiles: Profile[] = [];
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private _productsService = inject(ProductsService);
  private _finishesService = inject(FinishesService);

  protected isDropdownOpen = signal(false);
  protected headerClass = signal('');
  protected searchProfileControl = new FormControl('');
  protected filteredProfiles: Observable<any[]> = new Observable();

  constructor(
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.headerClass.set(this.customClass() ? this.customClass() : '');
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (window.scrollY > 50 && !this.customClass())
      this.headerClass.set('scrolled')
    else
      this.headerClass.set(this.customClass() || '')
  }

  onPerfilClick(category: string) {
    this._productsService.categorySelected.set(category);
    this.router.navigate(['/produtos'], { queryParams: { category: category.toUpperCase() } })
  }

  onFinishesClick(category: string): void {
    this.router.navigate(['/acabamentos', { outlets: { second: 'products' } }], { queryParams: { category: category.toLowerCase() } })
    this._finishesService.categorySelected.set(category);
  }

  changeLanguage(language: string) {
    this.translate.use(language)
    this.cdr.detectChanges()
    this.isDropdownOpen.set(false)
  }

  openDropdown() {
    this.isDropdownOpen.set(!this.isDropdownOpen())
  }

  logout() {
    this.authService.logout()
    this.router.navigate(['/login'])
  }

  onFocus(): void {
    if (this._profiles.length > 0)
      return;

    this._getAllProfiles();
  }

  private _getAllProfiles(): void {
    this._productsService.getProducts().subscribe(products => {
      this._profiles = products;
      this._setProfileObservable();
    });
  }

  private _setProfileObservable(): void {
    this.filteredProfiles = this.searchProfileControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): Profile[] {
    const filterValue = this._normalizeValue(value);
    return this._profiles.filter(profile => this._normalizeValue(profile.name).includes(filterValue));
  }

  private _normalizeValue(value: string): string {
    if (typeof value === 'string')
      return value.toLowerCase().replace(/\s/g, '');
    return '';
  }

  displayFn(profile: Profile): string {
    return profile && profile.name ? profile.name : '';
  }

  onProfileClick(profile: Profile) {
    this._productsService.productSelected.set(profile);
    this.router.navigate(['/produtos'], { queryParams: { product: profile.id } })
  }

  // Métodos para controlar o hover dos dropdowns
  protected onDropdownMouseEnter(event: Event): void {
    const target = event.currentTarget as HTMLElement;
    const dropdownMenu = target.querySelector('.dropdown-menu') as HTMLElement;
    if (dropdownMenu)
      dropdownMenu.classList.add('show');
  }

  protected onDropdownMouseLeave(event: Event): void {
    const target = event.currentTarget as HTMLElement;
    const dropdownMenu = target.querySelector('.dropdown-menu') as HTMLElement;
    if (dropdownMenu)
      dropdownMenu.classList.remove('show');
  }

}
