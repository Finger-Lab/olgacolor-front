import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../../../components/header/header.component";
import { FooterComponent } from "../../../components/footer/footer.component";
import { RouterLink } from "@angular/router";
import { SafePipe } from '../../../shared/safe.pipe';

@Component({
  selector: 'app-moveleira-ensaio',
  standalone: true,
  imports: [CommonModule, SafePipe, HeaderComponent, FooterComponent, RouterLink],
  templateUrl: './moveleira-ensaio.component.html',
  styleUrls: ['./moveleira-ensaio.component.scss']
})
export class MoveleiraEnsaioComponent {
  iframeUrl = 'https://clientes.metries.com.br/olgacolor/moveleira.htm'; // URL para simulação moveleira
  classScrolled: string = 'scrolled position-sticky';

  constructor() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
