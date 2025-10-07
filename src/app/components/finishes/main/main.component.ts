import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FinishesService } from '../../../pages/finishes/services/finishes.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

  private router = inject(Router);
  private finishesService = inject(FinishesService);

  onFinishClick(category: string): void {
    // Mapear categorias para corresponder exatamente ao banco de dados
    let mappedCategory = category;
    
    // Mapeamento específico para garantir compatibilidade
    switch (category) {
      case 'Pintura Eletrostática a Pó':
        mappedCategory = 'Pintura';
        break;
      case 'Efeito Madeira':
        mappedCategory = 'Efeito Madeira';
        break;
      case 'Anodização':
        mappedCategory = 'Anodização';
        break;
    }
    
    // Definir a categoria selecionada no serviço
    this.finishesService.categorySelected.set(mappedCategory);
    
    // Navegar para a página de acabamentos com o filtro aplicado
    this.router.navigate(['/acabamentos', { outlets: { second: 'products' } }], { 
      queryParams: { category: mappedCategory.toLowerCase().replace(/\s+/g, '-') } 
    });
  }

}
