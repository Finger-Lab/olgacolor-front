import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  constructor(private router: Router) {}

  onExploreClick() {
    this.router.navigate(['/catalogs/products']);
  }

  onCategoryClick(category: string) {
    this.router.navigate(['/catalogs/products'], {
      queryParams: { category: category }
    });
  }
}
