import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { MainComponent } from '../../components/furniture-line/main/main.component'; 
import { NewsletterComponent } from "../../components/newsletter/newsletter.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-furniture-line',
  imports: [HeaderComponent, MainComponent, FooterComponent],
  templateUrl: './furniture-line.component.html',
  styleUrl: './furniture-line.component.scss'
})
export class FurnitureLineComponent {
  classScrolled: string = 'scrolled position-sticky'

  constructor() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
