import { Component, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { AluminumService } from '../../../services/aluminum.service';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { RateDataInterface } from '../../../interfaces/rate-data.interface';

type LMEOptions = "ALUMINUM" | "USD";

@Component({
  selector: 'app-main',
  imports: [
    MatTabsModule,
    MatSelectModule,
    BaseChartDirective,
    CommonModule
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  private aluminumService = inject(AluminumService)
  public lineChartData: any = {
    labels: [],
    datasets: [
      { 
        data: [], 
        label: 'Variação Diária', 
        borderColor: 'blue', 
        backgroundColor: 'rgba(0, 0, 255, 0.2)',
        fill: true
      }
    ]
  }
  public lineChartOptions: ChartOptions = { responsive: true };
  public variations: any;
  public monthlyData: any[] = [];

  // Gerar meses dinamicamente
  months: { value: string, label: string, date: string }[] = this.generateMonthOptions();
  selectedMonth = this.months[0]?.value || this.getCurrentMonth(); // Primeiro mês da lista (mais recente)
  selectedDays: any[] = []

  metals: string[] = [
    'Alumínio',
    'Dólar'
  ]
  lmeOptions: Record<string, LMEOptions> = {
    'Alumínio': 'ALUMINUM',
    'Dólar': 'USD'
  }
  selectedOption = 'ALUMINUM'

  dailyPrices: { date: string, price: number }[] = []
  weeklyAverages: { week: string, avgPrice: number }[] = []

  // Gerar opções de mês dinamicamente
  generateMonthOptions(): { value: string, label: string, date: string }[] {
    const months = [];
    const currentDate = new Date();
    
    console.log('Current date in generateMonthOptions:', currentDate);
    console.log('Current month index:', currentDate.getMonth());
    
    // Gerar apenas até o mês atual (12 meses anteriores + mês atual)
    for (let i = 0; i >= -12; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const year = date.getFullYear().toString().slice(-2);
      const monthName = monthNames[date.getMonth()];
      
      console.log(`i=${i}, date=${date}, monthName=${monthName}/${year}`);
      
      months.push({
        value: `${monthName}/${year}`,
        label: `${monthName}/${year}`,
        date: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-01`
      });
    }
    
    console.log('Generated months:', months);
    return months; // Já está em ordem decrescente devido ao loop
  }

  // Obter o mês atual
  getCurrentMonth(): string {
    const currentDate = new Date();
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const year = currentDate.getFullYear().toString().slice(-2);
    const monthName = monthNames[currentDate.getMonth()];
    return `${monthName}/${year}`;
  }

  // Obter a data ISO do mês selecionado (primeiro dia)
  getSelectedMonthDate(): string {
    const selectedOption = this.months.find(m => m.value === this.selectedMonth);
    return selectedOption ? selectedOption.date : new Date().toISOString().slice(0, 10);
  }

  // Obter a data correta para buscar variações
  getVariationsDate(): string | undefined {
    const selectedOption = this.months.find(m => m.value === this.selectedMonth);
    
    if (!selectedOption) return undefined;
    
    // Criar data usando os componentes para evitar problemas de timezone
    const dateString = selectedOption.date; // '2025-08-01'
    const [year, month, day] = dateString.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day); // month - 1 porque Date() usa mês base 0
    const currentDate = new Date();
    
    // Comparar se o mês selecionado é o atual
    const isCurrentMonth = selectedDate.getFullYear() === currentDate.getFullYear() && 
      selectedDate.getMonth() === currentDate.getMonth();
    
    // Se for mês atual, não enviar data (usa hoje por padrão)
    // Se for mês anterior, usar último dia do mês selecionado
    if (isCurrentMonth) {
      return undefined; // API usará data de hoje por padrão
    } else {
      // Usar último dia do mês selecionado (mês anterior)
      const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      const result = lastDayOfMonth.toISOString().slice(0, 10);
      return result;
    }
  }

  ngOnInit(): void {
    this.fetchMetalData()
  }

  async onMonthChange(): Promise<void> {
    this.fetchMetalData();
  }

  async loadMonthlyData(): Promise<void> {
    try {
      const selectedDate = this.getSelectedMonthDate();
      
      const response = await this.aluminumService.getMonthlyRates(`${this.selectedOption}&date=${selectedDate}`)
      this.monthlyData = response?.rates || []
    } catch (error) {
      console.error('Erro ao carregar dados mensais:', error)
      this.monthlyData = []
    }
  }

  async fetchMetalData(): Promise<void> {
    try {
      // Zerar valores antes de carregar novos dados
      this.variations = null;
      this.monthlyData = [];
      this.dailyPrices = [];
      
      // Buscar variações: hoje por padrão, último dia do mês se for mês anterior
      const variationDate = this.getVariationsDate();
      console.log(variationDate)
      const res = await this.aluminumService.getVariations(this.selectedOption, variationDate)
      this.variations = res;
      
      await this.loadMonthlyData()
      const selectedMonthData = [...this.monthlyData];
      
      if (selectedMonthData.length > 0) {
        this.dailyPrices = selectedMonthData;
        console.log('Dados mensais:', this.dailyPrices);
        const variations = this.calculateVariations(this.dailyPrices)      
        this.updateChart(variations)
      } else {
        // Se não há dados, criar gráfico vazio
        this.updateChart({ dailyChange: [] });
      }
    } catch (error) {
      console.error('Erro ao buscar dados do metal:', error)
      // Zerar valores em caso de erro também
      this.variations = null;
      this.monthlyData = [];
      this.dailyPrices = [];
      this.updateChart({ dailyChange: [] });
    }
  }

  getWeekFromDate(date: string): string {
    const d = new Date(date)
    const week = Math.ceil(d.getDate() / 7)
    return `Semana ${week}/${d.getMonth() + 1}`
  }

  formatDateDisplay(dateString: string): string {
    if (!dateString) return '';
    
    // Extrai apenas a parte da data (antes do T se houver timestamp)
    const dateOnly = dateString.split('T')[0];
    
    // Evita problemas de timezone ao parsear data
    const parts = dateOnly.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  }

  calculateVariations(data: any[]): any {
    if (!data || data.length === 0) return { dailyChange: [] }

    const sortedData = [...data].sort((a, b) => new Date(a.rate_date).getTime() - new Date(b.rate_date).getTime())

    const dailyChange = sortedData.map((item, index, arr) => {
      if (index === 0) {
        return { 
          date: item.rate_date, 
          price: item.rate,
          change: 0, 
          percentageChange: 0 
        }
      }

      const previousPrice = arr[index - 1].rate
      const change = item.rate - previousPrice
      const percentageChange = ((change / previousPrice) * 100).toFixed(2)

      return {
        date: item.rate_date,
        price: item.rate,
        change: parseFloat(change.toFixed(2)),
        percentageChange: parseFloat(percentageChange)
      }
    })
    
    return { dailyChange }
  }

  updateChart(variations: any): void {
    if (!variations || !variations.dailyChange || variations.dailyChange.length === 0) {
      this.lineChartData = {
        labels: [],
        datasets: [
          { 
            data: [], 
            label: 'Preços Diários', 
            borderColor: '#2E86AB', 
            backgroundColor: 'rgba(46, 134, 171, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      };
      return;
    }

    const labels = variations.dailyChange.map((item: any) => {
      const date = new Date(item.date);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    });

    const prices = variations.dailyChange.map((item: any) => item.price);

    const metalName = this.selectedOption === 'ALUMINUM' ? 'Alumínio' : 'Dólar';

    this.lineChartData = {
      labels: labels,
      datasets: [
        { 
          data: prices,
          label: `Preços Diários - ${metalName} (${this.selectedMonth})`,
          borderColor: this.selectedOption === 'ALUMINUM' ? '#2E86AB' : '#A23B72',
          backgroundColor: this.selectedOption === 'ALUMINUM' ? 'rgba(46, 134, 171, 0.1)' : 'rgba(162, 59, 114, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: this.selectedOption === 'ALUMINUM' ? '#2E86AB' : '#A23B72',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }
      ]
    };

    // Configurar opções do gráfico com formatação de valores
    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (context: any) => {
              const value = context.parsed.y;
              const date = variations.dailyChange[context.dataIndex].date;
              const formattedDate = new Date(date).toLocaleDateString('pt-BR');
              return `${context.dataset.label}: ${value.toFixed(2)} (${formattedDate})`;
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Dias do Mês'
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: this.selectedOption === 'ALUMINUM' ? 'Preço (USD/ton)' : 'Cotação (R$)'
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            callback: (value: any) => {
              return value.toFixed(2);
            }
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    };
  }

  async onTabChange(index: number): Promise<void> {
    const selectedMetal = this.metals[index];
    this.selectedOption = this.lmeOptions[selectedMetal];
    await this.fetchMetalData()
  }
}
