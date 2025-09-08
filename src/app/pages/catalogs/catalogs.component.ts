import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { CatalogsService } from './catalogs.service';

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
export class CatalogsComponent {
  @ViewChild('drawer') drawer!: MatDrawer;
  protected readonly catalogsService = inject(CatalogsService);
  
  classScrolled: string = 'scrolled position-sticky';
  sortBy: 'name' | 'date' = 'name';
  selectedCategories: string[] = [];

  constructor() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
