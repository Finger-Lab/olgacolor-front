import { Component } from '@angular/core';
import { VisionComponent } from "../../components/home/vision/vision.component";
import { MarketsComponent } from "../../components/home/markets/markets.component";
import { ProductsComponent } from "../../components/home/products/products.component";
import { OlgacolorComponent } from "../../components/home/olgacolor/olgacolor.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { SliderCarouselComponent } from "../../components/home/slider-carousel/slider-carousel.component";
import { FinishesComponent } from "../../components/home/finishes/finishes.component";
import { ResponsibilityComponent } from "../../components/home/responsibility/responsibility.component";
import { BudgetComponent } from "../../components/home/budget/budget.component";
import { PriceComponent } from "../../components/home/price/price.component";
import { MainComponent } from "../../components/home/main/main.component";
import { HeaderComponent } from "../../components/header/header.component";
import { NewsletterComponent } from "../../components/newsletter/newsletter.component";

@Component({
  selector: 'app-home',
  imports: [
    VisionComponent,
    MarketsComponent,
    ProductsComponent,
    OlgacolorComponent,
    FooterComponent,
    SliderCarouselComponent,
    FinishesComponent,
    ResponsibilityComponent,
    BudgetComponent,
    PriceComponent,
    MainComponent,
    HeaderComponent,
    NewsletterComponent
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
