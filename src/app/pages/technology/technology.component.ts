import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { NewsletterComponent } from "../../components/newsletter/newsletter.component";
import { MainComponent } from "../../components/technology/main/main.component";
import { TraditionExcellenceComponent } from "../../components/technology/tradition-excellence/tradition-excellence.component";
import { ReferencesComponent } from "../../components/technology/references/references.component";
import { InfrastructureComponent } from "../../components/technology/infrastructure/infrastructure.component";

@Component({
  selector: 'app-technology',
  imports: [HeaderComponent, FooterComponent, MainComponent, TraditionExcellenceComponent, ReferencesComponent, InfrastructureComponent],
  templateUrl: './technology.component.html',
  styleUrl: './technology.component.scss'
})
export class TechnologyComponent {
  classScrolled: string = 'scrolled position-sticky'
}
