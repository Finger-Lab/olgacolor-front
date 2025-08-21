import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { MainComponent } from '../../components/profiles/main/main.component';
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-profiles',
  imports: [HeaderComponent, MainComponent, FooterComponent],
  templateUrl: './profiles.component.html',
  styleUrl: './profiles.component.scss'
})
export class ProfilesComponent {
  classScrolled: string = 'scrolled position-sticky';

  constructor() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
