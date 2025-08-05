import { Component, inject, OnInit, signal } from '@angular/core';
import { DividingLineComponent } from "../../dividing-line/dividing-line.component";
import { ApiResponse, PriceService } from '../../../services/price.service';
import { CommonModule } from '@angular/common';
import { catchError, filter, of } from 'rxjs';

@Component({
  selector: 'app-price',
  imports: [DividingLineComponent, CommonModule],
  templateUrl: './price.component.html',
  styleUrl: './price.component.scss'
})
export class PriceComponent implements OnInit {

  protected dynamicWidth = signal<number>(10);
  protected dynamicBg = signal<string>('#000');
  protected currencies = signal<any[]>([]);
  protected currentMonth = signal<number>(0);
  protected currentYear = signal<number>(0);

  private priceService = inject(PriceService);

  ngOnInit(): void {
    try {

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      this.currentMonth.set(currentMonth + 1);
      this.currentYear.set(currentYear);

      this.priceService.getCurrencies().pipe(
        catchError(_ => {
          console.error('Erro ao buscar cotação LME')
          return of(null)
        }),
        filter(response => !!response?.results?.currencies),
      ).subscribe((res: ApiResponse | null) => {
        if (!res) return

        const results = res.results;
        const currencies = results.currencies;

        const currencyKeys = Object.keys(currencies);

        for (let i = 1; i < 5; i++) {
          const key = currencyKeys[i]
          const currency = currencies[key]

          this.currencies.update(prev => [...prev, {
            sigla: key,
            buy: currency?.buy,
            name: currency.name,
            code: currency.code,
            variation: currency.variation
          }])
        };
      })
    } catch (error) {
      console.log('Erro ao buscar cotação LME', error)
    }
  }

}
