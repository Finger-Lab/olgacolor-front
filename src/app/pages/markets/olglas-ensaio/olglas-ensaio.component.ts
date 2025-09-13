import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../../../components/header/header.component";
import { FooterComponent } from "../../../components/footer/footer.component";
import { RouterLink } from "@angular/router";
import { SafePipe } from '../../../shared/safe.pipe';

@Component({
  selector: 'app-olglas-ensaio',
  standalone: true,
  imports: [CommonModule, SafePipe, HeaderComponent, FooterComponent, RouterLink],
  templateUrl: './olglas-ensaio.component.html',
  styleUrls: ['./olglas-ensaio.component.scss']
})
export class OlglasEnsaioComponent {
  iframeUrl = 'https://clientes.metries.com.br/olgacolor/janela.htm'; // URL para simulação 3D
  classScrolled: string = 'scrolled position-sticky';

  constructor() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
