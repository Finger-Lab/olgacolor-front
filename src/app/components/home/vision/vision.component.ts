import { Component, signal } from '@angular/core';
import { DividingLineComponent } from "../../dividing-line/dividing-line.component";

@Component({
  selector: 'app-vision',
  imports: [DividingLineComponent],
  templateUrl: './vision.component.html',
  styleUrl: './vision.component.scss'
})
export class VisionComponent {

  protected dynamicWidth = signal<number>(10);
  protected dynamicBg = signal<string>('#FFF');

}
