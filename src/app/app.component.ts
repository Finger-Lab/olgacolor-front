import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import AOS from 'aos';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true
})
export class AppComponent {
  title = 'olgacolor';
  private previousUrl: string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    // Escuta mudanças de rota e faz scroll para o topo apenas em mudanças de página principal
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (isPlatformBrowser(this.platformId)) {
        // Não fazer scroll automático na página de acabamentos para preservar posição
        const isFinishesPage = event.url.includes('/acabamentos');
        const isProductsNavigation = event.url.includes('/produtos');
        const hasDrawerOpen = document.body.classList.contains('drawer-open');
        
        // Só fazer scroll se não for navegação relacionada a acabamentos e não houver drawer aberto
        if (!isFinishesPage && !isProductsNavigation && !hasDrawerOpen) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        this.previousUrl = event.url;
      }
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: false,
      })
    }
  }
}
