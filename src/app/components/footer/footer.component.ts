import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

  private router = inject(Router);

  protected currentYear = new Date().getFullYear();

  protected onPerfilClick(category: string) {
    this.router.navigate(['/produtos'], { queryParams: { category: category.toUpperCase() } });
  }

  protected onFinishesClick(category: string): void {
    this.router.navigate(['/acabamentos'], { queryParams: { category: category.toUpperCase() } })
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
