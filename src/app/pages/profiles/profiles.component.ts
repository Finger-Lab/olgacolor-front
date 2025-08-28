import { Component, effect, inject, viewChild } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from "../../components/footer/footer.component";
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { ProfilesService } from './profiles.service';

@Component({
  selector: 'app-profiles',
  imports: [
    HeaderComponent,
    RouterOutlet,
    FooterComponent,
    MatSidenavModule
  ],
  templateUrl: './profiles.component.html',
  styleUrl: './profiles.component.scss'
})
export class ProfilesComponent {

  constructor() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    effect(() => {
      if (this.profilesService.selectedProduct())
        this._toggleDrawer();
    });
  }

  protected readonly profilesService = inject(ProfilesService);

  classScrolled: string = 'scrolled position-sticky';

  drawer = viewChild(MatDrawer);

  public _toggleDrawer(): void {
    if (this.drawer())
      this.drawer()?.toggle();
  }

}
