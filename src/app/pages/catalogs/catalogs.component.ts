import { Component, ViewChild, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CatalogsService } from './catalogs.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-catalogs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    RouterOutlet,
    FooterComponent,
    MatSidenavModule,
    MatListModule,
    MatRadioModule,
    MatButtonModule
  ],
  templateUrl: './catalogs.component.html',
  styleUrl: './catalogs.component.scss'
})
export class CatalogsComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') drawer!: MatDrawer;
  protected readonly catalogsService = inject(CatalogsService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();
  
  classScrolled: string = 'scrolled position-sticky';
  sortBy: 'name' | 'date' = 'name';
  selectedCategories: string[] = [];
  showSidebar: boolean = true;

  constructor() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnInit() {
    // Verificar rota inicial
    this.checkCurrentRoute();
    
    // Observar mudanças de rota
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.checkCurrentRoute();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkCurrentRoute() {
    const url = this.router.url;
    // Ocultar sidebar se estiver na página de material técnico
    this.showSidebar = !url.includes('/material-tecnico/');
    
    if (this.drawer) {
      if (this.showSidebar) {
        this.drawer.open();
      } else {
        this.drawer.close();
      }
    }
  }

  onCategoryChange(event: any) {
    this.selectedCategories = event.source.selectedOptions.selected.map((option: any) => option.value);
    this.catalogsService.filterByCategories(this.selectedCategories);
  }

  onSortChange() {
    this.catalogsService.sortCatalogs(this.sortBy);
  }

  clearFilters() {
    this.selectedCategories = [];
    this.sortBy = 'name';
    this.catalogsService.resetFilters();
  }
}
