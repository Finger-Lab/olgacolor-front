import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../../../components/header/header.component";
import { FooterComponent } from "../../../components/footer/footer.component";
import { RouterLink } from "@angular/router";
import { SafePipe } from './safe.pipe';

@Component({
  selector: 'app-janela-ensaio',
  standalone: true,
  imports: [CommonModule, SafePipe, HeaderComponent, FooterComponent, RouterLink],
  templateUrl: './janela-ensaio.component.html',
  styleUrls: ['./janela-ensaio.component.scss']
})
export class JanelaEnsaioComponent {
  iframeUrl = 'https://clientes.metries.com.br/olgacolor/janela.htm';
  classScrolled: string = 'scrolled position-sticky';

  constructor() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
