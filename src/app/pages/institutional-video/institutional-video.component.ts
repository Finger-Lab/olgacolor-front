import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-institutional-video',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './institutional-video.component.html',
  styleUrl: './institutional-video.component.scss'
})
export class InstitutionalVideoComponent {
  protected readonly classScrolled = 'scrolled position-sticky';
}
