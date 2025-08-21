import { Component, signal, inject } from '@angular/core';
import { DividingLineComponent } from "../../dividing-line/dividing-line.component";
import { NgFor, NgStyle } from '@angular/common';
import { Router } from '@angular/router';
import { FinishesService } from '../../../pages/finishes/services/finishes.service';

@Component({
  selector: 'app-finishes',
  imports: [
    DividingLineComponent,
    NgStyle,
    NgFor
  ],
  templateUrl: './finishes.component.html',
  styleUrl: './finishes.component.scss'
})
export class FinishesComponent {

  private router = inject(Router);
  private finishesService = inject(FinishesService);

  protected dynamicWidth = signal<number>(100);
  protected dynamicBg = signal<string>('transparent');

  protected finishes = [
    {
      title: 'ANODIZAÇÃO',
      content: 'Proteção eletroquímica que garante durabilidade, resistência e um acabamento sofisticado.',
      img: 'assets/images/home/finishes_first.avif',
      show: false,
      category: 'Anodização'
    },
    {
      title: 'PINTURA ELETROSTÁTICA A PÓ',
      content: 'Tecnologia de alta performance para um acabamento uniforme, resistente e de longa duração.',
      img: 'assets/images/home/finishes_second.avif',
      show: false,
      category: 'Pintura'
    },
    {
      title: 'EFEITO MADEIRA',
      content: 'A estética natural da madeira aliada à durabilidade do metal, criando harmonia entre design e resistência.',
      img: 'assets/images/home/finishes_third.avif',
      show: false,
      category: 'Efeito Madeira'
    }
  ]

  changeOpacity(index: number): void {
    this.finishes[index].show = !this.finishes[index].show
  }

  onSaibaMaisClick(category: string): void {
    // Definir a categoria selecionada no serviço
    this.finishesService.categorySelected.set(category);
    
    // Navegar para a página de acabamentos com o filtro aplicado
    this.router.navigate(['/acabamentos', { outlets: { second: 'products' } }], { 
      queryParams: { category: category.toLowerCase() } 
    });
  }

}
