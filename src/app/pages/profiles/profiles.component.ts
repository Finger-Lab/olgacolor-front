import { Component, effect, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from "../../components/footer/footer.component";
import { RouterOutlet } from '@angular/router';
import { ProfilesService } from './profiles.service';

@Component({
  selector: 'app-profiles',
  imports: [
    HeaderComponent,
    RouterOutlet,
    FooterComponent
  ],
  templateUrl: './profiles.component.html',
  styleUrl: './profiles.component.scss'
})
export class ProfilesComponent implements OnInit, OnDestroy {
  protected readonly profilesService = inject(ProfilesService);
  classScrolled: string = 'scrolled position-sticky';
  
  showZoomLens = false;
  zoomScale = 2; // Fator de zoom
  zoomOrigin = 'center center';

  constructor() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnInit() {
    // Registrar o componente globalmente para comunicação
    (window as any).profilesComponent = this;
  }

  ngOnDestroy() {
    // Limpar referência global
    delete (window as any).profilesComponent;
  }

  openImage(url: string){
    if(!url) return;
    window.open(url, '_blank');
  }

  public closeModal(): void {
    this.profilesService.selectedProduct.set(null);
    this.showZoomLens = false;
  }

  onImageMouseMove(event: MouseEvent): void {
    const container = event.currentTarget as HTMLElement;
    const imgWrapper = container.querySelector('.image-wrapper') as HTMLElement;
    const img = container.querySelector('.product-image') as HTMLImageElement;
    
    if (!img || !img.complete || !imgWrapper) return;
    
    const containerRect = container.getBoundingClientRect();
    const wrapperRect = imgWrapper.getBoundingClientRect();
    
    // Calcular posição do mouse dentro do container
    const mouseX = event.clientX - containerRect.left;
    const mouseY = event.clientY - containerRect.top;
    
    // Calcular posição relativa dentro da imagem
    const imgLeft = wrapperRect.left - containerRect.left;
    const imgTop = wrapperRect.top - containerRect.top;
    const imgWidth = wrapperRect.width;
    const imgHeight = wrapperRect.height;
    
    // Verificar se o mouse está sobre a imagem
    if (mouseX < imgLeft || mouseX > imgLeft + imgWidth || mouseY < imgTop || mouseY > imgTop + imgHeight) {
      this.showZoomLens = false;
      return;
    }
    
    // Calcular posição relativa dentro da imagem (0 a 1)
    const relativeX = (mouseX - imgLeft) / imgWidth;
    const relativeY = (mouseY - imgTop) / imgHeight;
    
    // Calcular origem da transformação no ponto exato do cursor
    // O zoom será aplicado a partir deste ponto, mantendo-o fixo
    this.zoomOrigin = `${relativeX * 100}% ${relativeY * 100}%`;
    
    this.showZoomLens = true;
  }

  onImageMouseLeave(): void {
    this.showZoomLens = false;
  }
}
