import { Component } from '@angular/core';
import { HeaderComponent } from "../../../components/header/header.component";
import { NewsletterComponent } from "../../../components/newsletter/newsletter.component";
import { FooterComponent } from "../../../components/footer/footer.component";
import { MainComponent } from '../../../components/processes-production/polishing/main/main.component';

@Component({
  selector: 'app-polishing',
  imports: [HeaderComponent, FooterComponent, MainComponent],
  templateUrl: './polishing.component.html',
  styleUrl: './polishing.component.scss'
})
export class PolishingComponent {
  classScrolled: string = 'scrolled position-sticky'
}
