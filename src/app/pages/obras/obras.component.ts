import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { CardsComponent } from './cards/cards.component';

@Component({
  selector: 'app-obras',
  imports: [HeaderComponent, FooterComponent, CardsComponent],
  templateUrl: './obras.component.html',
  styleUrl: './obras.component.scss'
})
export class ObrasComponent {
classScrolled: string = 'scrolled position-sticky'

  constructor() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
