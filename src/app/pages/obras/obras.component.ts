import { AfterViewInit, Component, ElementRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { CardsComponent } from './cards/cards.component';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Register Swiper web components
import { register } from 'swiper/element/bundle';
import { DividingLineComponent } from '../../components/dividing-line/dividing-line.component';
register()

@Component({
  selector: 'app-obras',
  imports: [HeaderComponent, FooterComponent, CardsComponent],
  templateUrl: './obras.component.html',
  styleUrl: './obras.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ObrasComponent implements AfterViewInit {
  classScrolled: string = 'scrolled position-sticky'

  constructor() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  @ViewChild('swiperContainer') swiperContainer!: ElementRef;
  
  protected dynamicWidth = signal<number>(10);
  protected dynamicBg = signal<string>('#000');
  
  // Configurações do Swiper
  protected swiperConfig = {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      clickable: true,
    },
    navigation: false, // Desabilitamos a navegação padrão
    breakpoints: {
      768: {
        slidesPerView: 1,
        spaceBetween: 40,
      },
      1024: {
        slidesPerView: 1,
        spaceBetween: 50,
      }
    }
  };

  // Array com as imagens organizadas em slides (3 imagens por slide)
  protected obras_slides = signal<any[]>([
    {
      id: 1,
      images: [
        { src: 'assets/images/obras/image25.png', alt: 'Obra 25' },
        { src: 'assets/images/obras/image26.png', alt: 'Obra 26' },
        { src: 'assets/images/obras/image27.png', alt: 'Obra 27' }
      ]
    },
    {
      id: 2,
      images: [
        { src: 'assets/images/obras/image28.png', alt: 'Obra 28' },
        { src: 'assets/images/obras/image29.png', alt: 'Obra 29' },
        { src: 'assets/images/obras/image30.png', alt: 'Obra 30' }
      ]
    }
  ]);

  // Manter o array original caso ainda seja necessário
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

  ngAfterViewInit() {
    this.setupCustomNavigation();
  }

  protected slidePrev() {
    const container = this.swiperContainer.nativeElement;
    const swiper = container.swiper;
    if (swiper) {
      swiper.slidePrev();
    }
  }

  protected slideNext() {
    const container = this.swiperContainer.nativeElement;
    const swiper = container.swiper;
    if (swiper) {
      swiper.slideNext();
    }
  }

  private setupCustomNavigation() {
    const container = this.swiperContainer.nativeElement;
    const swiper = container.swiper;

    if (swiper) {
      // Adicionar event listeners para as setas customizadas
      container.addEventListener('click', (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        if (x < 60) { // Área da seta esquerda
          swiper.slidePrev();
        } else if (x > width - 60) { // Área da seta direita
          swiper.slideNext();
        }
      });
    }
  }
}