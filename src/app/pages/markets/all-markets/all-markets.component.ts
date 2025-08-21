import { Component } from '@angular/core';
import { HeaderComponent } from "../../../components/header/header.component";
import { NewsletterComponent } from "../../../components/newsletter/newsletter.component";
import { FooterComponent } from "../../../components/footer/footer.component";
import { MarketsService } from '../../../services/markets.service';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-all-markets',
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './all-markets.component.html',
  styleUrl: './all-markets.component.scss'
})
export class AllMarketsComponent {

  protected readonly url = environment.apiUrl;

  constructor(
    private marketsService: MarketsService
  ) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  allMarkets: any = []

  ngOnInit(): void {
    this.marketsService.getMarkets().subscribe(res => {
      this.allMarkets = res
    })
  }

  classScrolled: string = 'scrolled position-sticky'
}
