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
  drawerTopPosition = signal<number>(100);

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
  }

  // Método para definir a posição do drawer baseado no elemento clicado
  setDrawerPosition(elementTop: number) {
    // Ajusta a posição considerando o scroll e a altura do header
    const headerHeight = 100;
    const scrollY = window.scrollY;
    const relativeTop = elementTop - scrollY;
    
    // Garante que o drawer não apareça muito no topo ou muito embaixo
    const minTop = headerHeight;
    const maxTop = window.innerHeight - 400; // 400px é aproximadamente a altura do drawer
    
    const finalTop = Math.max(minTop, Math.min(maxTop, relativeTop));
    this.drawerTopPosition.set(finalTop);
  }
}
