import { Component } from '@angular/core';
import { HeaderComponent } from "../../../components/header/header.component";
import { NewsletterComponent } from "../../../components/newsletter/newsletter.component";
import { FooterComponent } from "../../../components/footer/footer.component";
import { MainComponent } from '../../../components/processes-production/painting/main/main.component';

@Component({
  selector: 'app-painting',
  imports: [HeaderComponent, FooterComponent, MainComponent],
  templateUrl: './painting.component.html',
  styleUrl: './painting.component.scss'
})
export class PaintingComponent {
  classScrolled: string = 'scrolled position-sticky'
}
