import { Component, inject, OnInit, signal } from '@angular/core';
import { DividingLineComponent } from "../../dividing-line/dividing-line.component";
import { AluminumService } from '../../../services/aluminum.service';
import { CommonModule } from '@angular/common';

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

  private aluminumService = inject(AluminumService);

  ngOnInit(): void {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      this.currentMonth.set(currentMonth + 1);
      this.currentYear.set(currentYear);

      this.loadVariations();
    } catch (error) {
      console.log('Erro ao buscar variações', error)
    }
  }

  private async loadVariations(): Promise<void> {
    try {
      // Buscar valores atuais das cotações
      // const currentRates = await this.aluminumService.getRates();
      // console.log('Current rates response:', currentRates);
      
      // Buscar variações do dólar
      const dollarVariations = await this.aluminumService.getVariations('USD');
      
      // Buscar variações do alumínio
      const aluminumVariations = await this.aluminumService.getVariations('ALUMINUM');

      // Processar resposta do dólar
      let dollarDaily = 0;
      let dollarMonthly = 0;
      let dollarCurrentValue = 0;
      let dollarPreviousMonthValue = 0;
      
      dollarDaily = dollarVariations.variations.daily?.variation || 0;
      dollarMonthly = dollarVariations.variations.monthly?.variation || 0;
      dollarPreviousMonthValue = dollarVariations.variations.monthly?.previous || 0;

      // Processar resposta do alumínio
      let aluminumDaily = 0;
      let aluminumMonthly = 0;
      let aluminumCurrentValue = 0;
      let aluminumPreviousMonthValue = 0;
     
      aluminumDaily = aluminumVariations.variations.daily?.variation || 0;
      aluminumMonthly = aluminumVariations.variations.monthly?.variation || 0;
      aluminumPreviousMonthValue = aluminumVariations.variations.monthly?.previous || 0;

      // Extrair valores atuais das cotações
      dollarCurrentValue = dollarVariations?.variations.daily.current || 0;
      aluminumCurrentValue = aluminumVariations.variations.daily.current || 0;

      // Definir as currencies com variações separadas como itens individuais
      const currencies = [
        // Dólar - Variação Diária
        {
          sigla: 'USD',
          name: 'Dólar - Variação Diária',
          currentValue: dollarCurrentValue,
          variation: dollarDaily,
          type: 'currency',
          period: 'diário'
        },
        // Dólar - Variação Mensal
        {
          sigla: 'USD',
          name: 'Dólar - Variação Mensal',
          previousValue: dollarPreviousMonthValue,
          currentValue: dollarCurrentValue,
          variation: dollarMonthly,
          type: 'currency',
          period: 'mensal'
        },
        // Alumínio - Variação Diária
        {
          sigla: 'ALU',
          name: 'Alumínio - Variação Diária',
          currentValue: aluminumCurrentValue,
          variation: aluminumDaily,
          type: 'commodity',
          period: 'diário'
        },
        // Alumínio - Variação Mensal
        {
          sigla: 'ALU',
          name: 'Alumínio - Variação Mensal',
          previousValue:  aluminumPreviousMonthValue,
          currentValue: aluminumCurrentValue,
          variation: aluminumMonthly,
          type: 'commodity',
          period: 'mensal'
        }
      ];

      this.currencies.set(currencies);
    } catch (error) {
      console.error('Erro ao buscar variações:', error);
    }
  }

}
