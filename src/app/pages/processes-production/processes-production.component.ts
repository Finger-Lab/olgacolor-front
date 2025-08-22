import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { NewsletterComponent } from "../../components/newsletter/newsletter.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { MainComponent } from "../../components/processes-production/main/main.component";

@Component({
  selector: 'app-processes-production',
  imports: [HeaderComponent, FooterComponent, MainComponent],
  templateUrl: './processes-production.component.html',
  styleUrl: './processes-production.component.scss'
})
export class ProcessesProductionComponent {
  classScrolled: string = 'scrolled position-sticky'

  constructor() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
