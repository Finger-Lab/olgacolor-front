import { Component } from '@angular/core';
import { HeaderComponent } from "../../../components/header/header.component";
import { FooterComponent } from "../../../components/footer/footer.component";
import { MainComponent } from '../../../components/processes-production/wood-effect/main/main.component';

@Component({
  selector: 'app-wood-effect',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, MainComponent],
  templateUrl: './wood-effect.component.html',
  styleUrl: './wood-effect.component.scss'
})
export class WoodEffectComponent {
  classScrolled: string = 'scrolled position-sticky'

  constructor() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
