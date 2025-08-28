import { Component } from '@angular/core';
import { HeaderComponent } from "../../../components/header/header.component";
import { NewsletterComponent } from "../../../components/newsletter/newsletter.component";
import { FooterComponent } from "../../../components/footer/footer.component";
import { MainComponent } from '../../../components/processes-production/blasting/main/main.component';

@Component({
  selector: 'app-blasting',
  imports: [HeaderComponent, FooterComponent, MainComponent],
  templateUrl: './blasting.component.html',
  styleUrl: './blasting.component.scss'
})
export class BlastingComponent {
  classScrolled: string = 'scrolled position-sticky'
}
