import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ProductsService } from '../../../services/products.service';
import { ProfilesService } from '../../../pages/profiles/profiles.service';

@Component({
  selector: 'app-main',
  imports: [RouterLink],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  private router = inject(Router);
  private _profilesService = inject(ProfilesService);

  protected onPerfilClick(category: string) {
    // Armazenar a categoria e navegar para a rota correta de perfis/produtos
    this._profilesService.categorySelected.set(category);
    // Manter capitalização original e navegar para /perfis/produtos com query string
    this.router.navigate(['/perfis', 'produtos'], { queryParams: { category } });
  }
}
