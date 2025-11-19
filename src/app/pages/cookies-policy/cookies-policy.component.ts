import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-cookies-policy',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './cookies-policy.component.html',
  styleUrl: './cookies-policy.component.scss'
})
export class CookiesPolicyComponent {
  protected readonly classScrolled = 'scrolled position-sticky';
}


