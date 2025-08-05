import { Component, signal } from '@angular/core';
import { DividingLineComponent } from "../../dividing-line/dividing-line.component";
import { NgFor, NgStyle } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-finishes',
  imports: [
    DividingLineComponent,
    NgStyle,
    NgFor,
    RouterLink
  ],
  templateUrl: './finishes.component.html',
  styleUrl: './finishes.component.scss'
})
export class FinishesComponent {

  protected dynamicWidth = signal<number>(100);
  protected dynamicBg = signal<string>('transparent');

  protected finishes = [
    {
      title: 'ANODIZAÇÃO',
      content: 'Proteção eletroquímica que garante durabilidade, resistência e um acabamento sofisticado.',
      img: 'assets/images/home/finishes_first.avif',
      show: false,
      route: '/acabamentos/(second:products)'
    },
    {
      title: 'PINTURA ELETROSTÁTICA A PÓ',
      content: 'Tecnologia de alta performance para um acabamento uniforme, resistente e de longa duração.',
      img: 'assets/images/home/finishes_second.avif',
      show: false,
      route: '/acabamentos/(second:products)'
    },
    {
      title: 'EFEITO MADEIRA',
      content: 'A estética natural da madeira aliada à durabilidade do metal, criando harmonia entre design e resistência.',
      img: 'assets/images/home/finishes_third.avif',
      show: false,
      route: '/acabamentos/(second:products)'
    }
  ]

  changeOpacity(index: number): void {
    this.finishes[index].show = !this.finishes[index].show
  }

}
