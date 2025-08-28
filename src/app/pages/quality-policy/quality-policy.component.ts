import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-quality-policy',
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './quality-policy.component.html',
  styleUrl: './quality-policy.component.scss'
})
export class QualityPolicyComponent { }
