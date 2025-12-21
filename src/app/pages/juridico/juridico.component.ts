import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-juridico',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './juridico.component.html',
  styleUrl: './juridico.component.scss'
})
export class JuridicoComponent {
  protected readonly classScrolled = 'scrolled position-sticky';
}
