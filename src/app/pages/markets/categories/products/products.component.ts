import { Component } from '@angular/core';
import { HeaderComponent } from "../../../../components/header/header.component";
import { NewsletterComponent } from "../../../../components/newsletter/newsletter.component";
import { FooterComponent } from "../../../../components/footer/footer.component";
import { ActivatedRoute, Router } from '@angular/router';
import { MarketsService } from '../../../../services/markets.service';
import { environment } from '../../../../../environments/environment.development';

@Component({
  selector: 'app-products',
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {
  classScrolled: string = 'scrolled position-sticky'
  products: any[] = []
  category: string | null = null
  productsCategory: any[] = []

  protected readonly url = environment.apiUrl;

  constructor(
    private marketsService: MarketsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnInit(): void {
    this.marketsService.getMarkets().subscribe((res: any) => {
      this.products = res

      this.route.queryParams.subscribe(params => {
        this.category = params['category']

        if (this.category) {
          this.productsCategory = this.products.filter((p: any) => p.category.toUpperCase() === this.category!.toUpperCase())
        } else {
          this.productsCategory = []
        }
      })
    })
  }

  onProductClick(name: string) {
    this.router.navigate(['/mercados/categorias/produtos/produto'], { queryParams: { name: name.toUpperCase() } })
  }
}
