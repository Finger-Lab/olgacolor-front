import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { MainComponent } from '../../components/contact/main/main.component';
import { NewsletterComponent } from "../../components/newsletter/newsletter.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-contact',
  imports: [HeaderComponent, MainComponent, FooterComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  classScrolled: string = 'scrolled position-sticky'
}
