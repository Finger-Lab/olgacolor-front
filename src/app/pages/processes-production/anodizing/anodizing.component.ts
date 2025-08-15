import { Component } from '@angular/core';
import { HeaderComponent } from "../../../components/header/header.component";
import { NewsletterComponent } from "../../../components/newsletter/newsletter.component";
import { FooterComponent } from "../../../components/footer/footer.component";
import { MainComponent } from '../../../components/processes-production/anodizing/main/main.component';

@Component({
  selector: 'app-anodizing',
  imports: [HeaderComponent, FooterComponent, MainComponent],
  templateUrl: './anodizing.component.html',
  styleUrl: './anodizing.component.scss'
})
export class AnodizingComponent {
  classScrolled: string = 'scrolled position-sticky'
}
