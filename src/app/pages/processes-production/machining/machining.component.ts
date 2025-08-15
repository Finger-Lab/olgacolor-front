import { Component } from '@angular/core';
import { HeaderComponent } from "../../../components/header/header.component";
import { NewsletterComponent } from "../../../components/newsletter/newsletter.component";
import { FooterComponent } from "../../../components/footer/footer.component";
import { MainComponent } from '../../../components/processes-production/machining/main/main.component';

@Component({
  selector: 'app-machining',
  imports: [HeaderComponent, FooterComponent, MainComponent],
  templateUrl: './machining.component.html',
  styleUrl: './machining.component.scss'
})
export class MachiningComponent {
  classScrolled: string = 'scrolled position-sticky'
}
