import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { MainComponent } from '../../components/glazing/main/main.component';
import { NewsletterComponent } from "../../components/newsletter/newsletter.component";
import { FooterComponent } from "../../components/footer/footer.component"; 

@Component({
  selector: 'app-glazing',
  imports: [HeaderComponent, MainComponent, NewsletterComponent, FooterComponent],
  templateUrl: './glazing.component.html',
  styleUrl: './glazing.component.scss'
})
export class GlazingComponent {
  classScrolled: string = 'scrolled position-sticky'
}
