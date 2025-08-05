import { Component, inject, OnInit, signal } from '@angular/core';
import { DividingLineComponent } from "../../dividing-line/dividing-line.component";
import { PriceService } from '../../../services/price.service';
import { CommonModule } from '@angular/common';
import { catchError, filter, map, of } from 'rxjs';

@Component({
  selector: 'app-price',
  imports: [DividingLineComponent, CommonModule],
  templateUrl: './price.component.html',
  styleUrl: './price.component.scss'
})
export class PriceComponent implements OnInit {

  protected dynamicWidth = signal<number>(10);
  protected dynamicBg = signal<string>('#FFF');
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
        map(response => response?.results?.currencies)
      ).subscribe((res: any) => {
        if (!res) return

        this.currencies.set([{
          sigla: 'USD',
          buy: res?.USD?.buy,
          name: res?.USD?.name,
          code: res?.USD?.code,
          variation: res?.USD?.variation
        }]);
      })
    } catch (error) {
      console.log('Erro ao buscar cotação LME', error)
    }
  }

}
