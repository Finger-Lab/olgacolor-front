import { isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, PLATFORM_ID, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FacadeSystemsService, FacadeSystem } from '../../../services/facade-systems.service';

@Component({
  selector: 'app-slider-carousel',
  imports: [CommonModule],
  templateUrl: './slider-carousel.component.html',
  styleUrl: './slider-carousel.component.scss'
})
export class SliderCarouselComponent implements OnInit {
  obras = signal<FacadeSystem[]>([]);
  loading = signal<boolean>(true);
  
  // Propriedade computed que combina obras reais com fallback
  displayItems = computed(() => {
    const obrasData = this.obras();
    if (obrasData.length > 0) {
      return obrasData.map(obra => ({
        id: obra.id,
        src: obra.imageUrl || 'assets/images/logo_olgacolor_color.avif',
        title: obra.title || 'Obra Olgacolor',
        subtitle: `${obra.location || 'Em breve'} - ${obra.construtora || 'Olgacolor'}`
      }));
    }
    
    // Fallback para imagens estáticas
    return [
      {
        id: undefined,
        src: 'assets/images/home/slider-carousel-1.webp',
        title: 'Allard Oscar Freire',
        subtitle: 'Gafisa, Arthur Casas, Alex Allard.'
      },
      {
        id: undefined,
        src: 'assets/images/home/slider-carousel-2.webp',
        title: 'Tonino Lamborghini',
        subtitle: 'Gafisa'
      },
      {
        id: undefined,
        src: 'assets/images/home/slider-carousel-3.webp',
        title: 'Tom Delfim Moreira',
        subtitle: 'Gafisa e Escritório de Arquitetura californiano Gensler'
      },
      {
        id: undefined,
        src: 'assets/images/home/slider-carousel-4.webp',
        title: 'Invert Campo Belo',
        subtitle: 'Gafisa'
      },
      {
        id: undefined,
        src: 'assets/images/home/slider-carousel-5.webp',
        title: '',
        subtitle: ''
      },
      {
        id: undefined,
        src: 'assets/images/home/slider-carousel-6.webp',
        title: '',
        subtitle: ''
      },
      {
        id: undefined,
        src: 'assets/images/home/slider-carousel-7.webp',
        title: '',
        subtitle: ''
      },
      {
        id: undefined,
        src: 'assets/images/home/slider-carousel-8.webp',
        title: '',
        subtitle: ''
      },
      {
        id: undefined,
        src: 'assets/images/home/slider-carousel-9.webp',
        title: '',
        subtitle: ''
      },
      {
        id: undefined,
        src: 'assets/images/home/slider-carousel-10.webp',
        title: '',
        subtitle: ''
      }
    ];
  });
  
  currentIndex = 0
  itemsPerSlide = 1

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private facadeSystemsService: FacadeSystemsService,
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.updateItems()
    }
  }
  
  ngOnInit() {
    this.loadObras();
  }
  
  loadObras() {
    this.facadeSystemsService.getFacadeSystems().subscribe({
      next: (obras) => {
        // Pegar apenas as primeiras 10 obras que tenham imagem
        const obrasComImagem = obras.filter(obra => obra.imageUrl).slice(0, 10);
        this.obras.set(obrasComImagem);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar obras:', error);
        this.loading.set(false);
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.updateItems()
  }
  
  updateItems() {
    if (isPlatformBrowser(this.platformId)) {
      const width = window.innerWidth
      if (width >= 576 && width < 768) {
        this.itemsPerSlide = 2
      } else if (width >= 768 && width < 992) {
        this.itemsPerSlide = 3
      } else if (width >= 992) {
        this.itemsPerSlide = 5
      } else {
        this.itemsPerSlide = 1
      }
    }
  }

  moveSlide(direction: number): void {  
    if (direction > 0) {
      this.currentIndex += this.itemsPerSlide
      if (this.currentIndex >= this.displayItems().length) {
        this.currentIndex = 0
      }
    } else {
      this.currentIndex -= this.itemsPerSlide
      if (this.currentIndex < 0) {
        this.currentIndex = this.displayItems().length - this.itemsPerSlide
      }
    }
  
    const translateXPercentage = (this.currentIndex / this.itemsPerSlide) * 100
    
    const carousel = document.querySelector('.list-carousel') as HTMLElement
    carousel.style.transform = `translateX(-${translateXPercentage}%)`
  }
  
  navigateToObra(item: any): void {
    // Se tem ID (obra real), navega para a página de detalhes
    if (item.id) {
      this.router.navigate(['/obra', item.id]);
    }
    // Se não tem ID (fallback), não faz nada ou pode mostrar uma mensagem
  }

  onCarouselImageError(event: any): void {
    console.log('❌ Erro ao carregar imagem no carousel, usando fallback');
    event.target.src = 'assets/images/logo_olgacolor_color.avif';
  }
}
