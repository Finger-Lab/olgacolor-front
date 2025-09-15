import { AfterViewInit, Component, ElementRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { CardsComponent } from './cards/cards.component';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Register Swiper web components
import { register } from 'swiper/element/bundle';
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
  
  // Configurações do Swiper - adaptadas para diferentes breakpoints
  protected swiperConfig = {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    pagination: {
      clickable: true,
      dynamicBullets: true,
    },
    navigation: false, // Desabilitamos a navegação padrão
    breakpoints: {
      // Mobile (até 575px) - 1 imagem por slide
      320: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
      // Mobile grande (576px+) - ainda 1 por slide mas com mais espaço
      576: {
        slidesPerView: 1,
        spaceBetween: 15,
      },
      // Tablets (768px+) - manteremos 1 slide mas com 2 imagens por slide
      768: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
      // Tablets grandes (992px+) - 1 slide com 2 imagens
      992: {
        slidesPerView: 1,
        spaceBetween: 25,
      }
    }
  };

  // Array com todas as imagens (será usado dinamicamente)
  protected allImages = [
    { src: 'assets/images/obras/image25.png', alt: 'Obra 25' },
    { src: 'assets/images/obras/image26.png', alt: 'Obra 26' },
    { src: 'assets/images/obras/image27.png', alt: 'Obra 27' },
    { src: 'assets/images/obras/image28.png', alt: 'Obra 28' },
    { src: 'assets/images/obras/image29.png', alt: 'Obra 29' },
    { src: 'assets/images/obras/image30.png', alt: 'Obra 30' }
  ];

  // Slides organizados para o swiper (2 imagens por slide para tablets/mobile)
  protected obras_slides = signal<any[]>([
    {
      id: 1,
      images: [
        { src: 'assets/images/obras/image25.png', alt: 'Obra 25' },
        { src: 'assets/images/obras/image26.png', alt: 'Obra 26' }
      ]
    },
    {
      id: 2,
      images: [
        { src: 'assets/images/obras/image27.png', alt: 'Obra 27' },
        { src: 'assets/images/obras/image28.png', alt: 'Obra 28' }
      ]
    },
    {
      id: 3,
      images: [
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
      description: 'Sistema de atenuação acústica para portas e janelas deslizantes e de giro, que reduzem até 39dB os ruídos característicos dos grandes centros urbanos.',
      productImg: 'assets/images/home/products_lock.avif',
      altProduct: 'Imagem de produtos Lock',
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
      description: 'Sistema construtivo para fachadas cortina e entre vãos. Os perfis de alumínio se sobrepõem externamente criando formas geométricas planejadas.',
      productImg: 'assets/images/home/products_grid.avif',
      altProduct: 'Imagem de produtos Grid',
      isLeft: true,
      isLast: true
    },
  ]);

  ngAfterViewInit() {
    this.setupCustomNavigation();
    this.handleResize();
    
    // Listener para mudanças de tamanho da janela
    window.addEventListener('resize', () => this.handleResize());
  }

  protected slidePrev() {
    const container = this.swiperContainer?.nativeElement;
    const swiper = container?.swiper;
    if (swiper) {
      swiper.slidePrev();
    }
  }

  protected slideNext() {
    const container = this.swiperContainer?.nativeElement;
    const swiper = container?.swiper;
    if (swiper) {
      swiper.slideNext();
    }
  }

  private setupCustomNavigation() {
    const container = this.swiperContainer?.nativeElement;
    const swiper = container?.swiper;

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

  private handleResize() {
    // Função que pode ser usada para lógicas adicionais baseadas no tamanho da tela
    const screenWidth = window.innerWidth;
    
    // Exemplo: ajustar configurações do swiper baseado na tela
    if (screenWidth >= 1200) {
      // Tela grande - grid é visível, swiper oculto
      console.log('Modo grid ativo');
    } else {
      // Tela pequena - swiper é visível
      console.log('Modo swiper ativo');
    }
  }

  ngOnDestroy() {
    // Cleanup do event listener
    window.removeEventListener('resize', this.handleResize.bind(this));
  }
}