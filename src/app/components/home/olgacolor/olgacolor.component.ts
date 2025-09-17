import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DividingLineComponent } from "../../dividing-line/dividing-line.component";

@Component({
  selector: 'app-olgacolor',
  standalone: true,
  imports: [CommonModule, DividingLineComponent],
  templateUrl: './olgacolor.component.html',
  styleUrl: './olgacolor.component.scss'
})
export class OlgacolorComponent {
  dynamicWidth: number = 30
  dynamicBg: string = '#FFF'
}
