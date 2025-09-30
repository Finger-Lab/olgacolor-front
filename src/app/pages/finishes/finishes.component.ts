import { Component, effect, inject, PLATFORM_ID } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { NewsletterComponent } from "../../components/newsletter/newsletter.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { RouterOutlet } from '@angular/router';
import { FinishesService } from './services/finishes.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-finishes',
  imports: [
    HeaderComponent,
    RouterOutlet,
    FooterComponent
  ],
  templateUrl: './finishes.component.html',
  styleUrl: './finishes.component.scss'
})
export class FinishesComponent {
  protected readonly _finishesService = inject(FinishesService);
  private readonly platformId = inject(PLATFORM_ID);
  private originalScrollPosition = { x: 0, y: 0 };

  constructor() {
    // Effect para controlar scroll quando drawer abre/fecha
    effect(() => {
      const selectedProduct = this._finishesService.selectedProduct();
      
      if (isPlatformBrowser(this.platformId)) {
        if (selectedProduct) {
          // Produto selecionado - bloquear scroll
          this.lockScroll();
        } else {
          // Produto desmarcado - liberar scroll
          this.unlockScroll();
        }
      }
    });
  }

  classScrolled: string = 'scrolled position-sticky'

  private lockScroll(): void {
    // Capturar posição atual
    this.originalScrollPosition = {
      x: window.scrollX,
      y: window.scrollY
    };
    
    console.log('🔒 Bloqueando scroll na posição:', this.originalScrollPosition);
    
    // Bloquear scroll de forma mais direta
    const body = document.body;
    const html = document.documentElement;
    
    body.style.position = 'fixed';
    body.style.top = `-${this.originalScrollPosition.y}px`;
    body.style.left = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    
    html.style.overflow = 'hidden';
    
    body.classList.add('drawer-open');
    html.classList.add('drawer-open');
  }

  private unlockScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    console.log('🔓 Liberando scroll para posição:', this.originalScrollPosition);
    
    const body = document.body;
    const html = document.documentElement;
    
    // Remover classes e estilos
    body.classList.remove('drawer-open');
    html.classList.remove('drawer-open');
    
    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.width = '';
    body.style.overflow = '';
    
    html.style.overflow = '';
    
    // Restaurar posição
    window.scrollTo(this.originalScrollPosition.x, this.originalScrollPosition.y);
    
    console.log('✅ Posição restaurada para:', window.scrollY);
  }

  public closeModal(): void {
    // Simplesmente limpar o produto selecionado - o effect vai cuidar do resto
    this._finishesService.selectedProduct.set(null);
  }
}
