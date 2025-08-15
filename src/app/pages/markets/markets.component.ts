import { Component } from '@angular/core';
import { MainComponent } from '../../components/markets/main/main.component';
import { HeaderComponent } from "../../components/header/header.component";
import { NewsletterComponent } from "../../components/newsletter/newsletter.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-markets',
  imports: [MainComponent, HeaderComponent, FooterComponent],
  templateUrl: './markets.component.html',
  styleUrl: './markets.component.scss'
})
export class MarketsComponent {
  classScrolled: string = 'scrolled position-sticky'
}
