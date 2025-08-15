import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { MainComponent } from '../../components/informative/main/main.component';
import { NewsletterComponent } from "../../components/newsletter/newsletter.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-informative',
  imports: [HeaderComponent, MainComponent, FooterComponent],
  templateUrl: './informative.component.html',
  styleUrl: './informative.component.scss'
})
export class InformativeComponent {
  classScrolled: string = 'scrolled position-sticky'
}
