import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { MainComponent } from '../../components/lme/main/main.component';
import { NewsletterComponent } from "../../components/newsletter/newsletter.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-lme',
  imports: [HeaderComponent, MainComponent, FooterComponent],
  templateUrl: './lme.component.html',
  styleUrl: './lme.component.scss'
})
export class LmeComponent {
  classScrolled: string = 'scrolled position-sticky'
}
