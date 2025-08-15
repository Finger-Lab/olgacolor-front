import { Component, effect, inject, viewChild } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { NewsletterComponent } from "../../components/newsletter/newsletter.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { FinishesService } from './services/finishes.service';

@Component({
  selector: 'app-finishes',
  imports: [
    HeaderComponent,
    RouterOutlet,
    FooterComponent,
    MatSidenavModule
  ],
  templateUrl: './finishes.component.html',
  styleUrl: './finishes.component.scss'
})
export class FinishesComponent {

  protected readonly _finishesService = inject(FinishesService);

  classScrolled: string = 'scrolled position-sticky'

  drawer = viewChild(MatDrawer);

  constructor() {
    effect(() => {
      if (this._finishesService.selectedProduct()) {
        this._toggleDrawer();
      }
    });
  }

  public _toggleDrawer(): void {
    if (this.drawer())
      this.drawer()?.toggle();
  }

}
