import { Component, signal } from '@angular/core';
import { DividingLineComponent } from "../../dividing-line/dividing-line.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-products',
  imports: [DividingLineComponent, RouterLink],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {

  protected dynamicWidth = signal<number>(10);
  protected dynamicBg = signal<string>('#000');
  protected products_blocks = signal<any[]>([
    {
      imgSrc: 'assets/images/home/aglo.avif',
      altImg: 'Logo da aglo',
      details: [
        { value: '28 dB', description: 'Porta de correr 02 folhas' },
        { value: '31 dB', description: 'para carregamento total' }
      ],
      description: 'Sistemas residenciais e comerciais completos para todos os padrões: alto, médio e popular. Atendem plenamente às normas nas cinco regiões do país.',
      productImg: 'assets/images/home/products_aglo.avif',
      altProduct: 'Imagem de produtos Aglo',
      isLeft: true,
      isLast: false
    },
    {
      imgSrc: 'assets/images/home/lock.avif',
      altImg: 'Logo da Lock',
      details: [
        { value: '39 dB', description: 'Sistema residencial acústico' },
        { value: '45mm', description: 'Perfis de Bitola' }
      ],
      description: 'Sistema de atenuação acústica para portas e janelas deslizantes e de giro, que reduzem até 39dB os ruídos característicos dos grandes centros urbanos. Ultrapassam os desempenhos exigidos pelas normas brasileiras e garantem além do isolamento sonoro, estanqueidade ao ar, água e ao vento.',
      productImg: 'assets/images/home/products_lock.avif',
      altProduct: 'Imagem de produtos Aglo',
      isLeft: false,
      isLast: false
    },
    {
      imgSrc: 'assets/images/home/grid.avif',
      altImg: 'Logo da Grid',
      details: [
        { value: '90°', description: 'Sistema construtivo para colunas' },
        { value: '45°', description: 'Equadrações do maxim-ar' }
      ],
      description: 'Sistema construtivo para fachadas cortina e entre vãos. Os perfis de alumínio se sobrepõem externamente criando formas geométricas planejadas com forte apelo estético. Sistema construtivo à 90˚para colunas, ancoragens, travessas, presilhas e tampas, sendo as requadrações do maxim-ar à 45˚, gerando excelente produtividade na fabricação e instalação.',
      productImg: 'assets/images/home/products_grid.avif',
      altProduct: 'Imagem de produtos Grid',
      isLeft: true,
      isLast: true
    },
  ]);

}
