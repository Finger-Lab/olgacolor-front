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
}
