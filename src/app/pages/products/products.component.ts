import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { MainComponent } from '../../components/products/main/main.component';
import { NewsletterComponent } from "../../components/newsletter/newsletter.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-products',
  imports: [HeaderComponent, MainComponent, FooterComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {
  classScrolled: string = 'scrolled position-sticky'
}
