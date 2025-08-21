import { Component, HostListener } from '@angular/core';
import { MainComponent } from '../../components/environmental-responsibility/main/main.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-environmental-responsibility',
  standalone: true,
  imports: [MainComponent, HeaderComponent, FooterComponent],
  templateUrl: './environmental-responsibility.component.html',
  styleUrl: './environmental-responsibility.component.scss'
})
export class EnvironmentalResponsibilityComponent {
  classScrolled: string = 'scrolled position-sticky';

  constructor() {
    document.title = 'Responsabilidade Ambiental - Olgacolor';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
