import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { MainComponent } from '../../components/catalogs/main/main.component';
import { NewsletterComponent } from "../../components/newsletter/newsletter.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-catalogs',
  imports: [HeaderComponent, MainComponent, FooterComponent],
  templateUrl: './catalogs.component.html',
  styleUrl: './catalogs.component.scss'
})
export class CatalogsComponent {
  classScrolled: string = 'scrolled position-sticky'
}
