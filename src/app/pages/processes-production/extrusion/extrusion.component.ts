import { Component } from '@angular/core';
import { HeaderComponent } from "../../../components/header/header.component";
import { NewsletterComponent } from "../../../components/newsletter/newsletter.component";
import { FooterComponent } from "../../../components/footer/footer.component";
import { MainComponent } from "../../../components/processes-production/extrusion/main/main.component";

@Component({
  selector: 'app-extrusion',
  imports: [HeaderComponent, FooterComponent, MainComponent],
  templateUrl: './extrusion.component.html',
  styleUrl: './extrusion.component.scss'
})
export class ExtrusionComponent {
  classScrolled: string = 'scrolled position-sticky'
}
