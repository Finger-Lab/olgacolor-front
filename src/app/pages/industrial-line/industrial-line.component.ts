import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { MainComponent } from '../../components/industrial-line/main/main.component';
import { NewsletterComponent } from "../../components/newsletter/newsletter.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-industrial-line',
  imports: [HeaderComponent, MainComponent, FooterComponent],
  templateUrl: './industrial-line.component.html',
  styleUrl: './industrial-line.component.scss'
})
export class IndustrialLineComponent {
  classScrolled: string = 'scrolled position-sticky'

  constructor() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
