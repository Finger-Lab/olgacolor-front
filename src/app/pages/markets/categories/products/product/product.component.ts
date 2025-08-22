import { Component } from '@angular/core';
import { HeaderComponent } from "../../../../../components/header/header.component";
import { NewsletterComponent } from "../../../../../components/newsletter/newsletter.component";
import { FooterComponent } from "../../../../../components/footer/footer.component";
import { ActivatedRoute } from '@angular/router';
import { MarketsService } from '../../../../../services/markets.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../../environments/environment.development';

@Component({
  selector: 'app-product',
  imports: [HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {
  classScrolled: string = 'scrolled position-sticky'
  productName: string | null = null
  products: any[] = []
  product: any = {}
  carouselImages: any = []
  currentIndex: number = 0
  isModalOpen: boolean = false
  descriptionShow: boolean = false

  protected readonly url = environment.apiUrl;

  showText() {
    this.descriptionShow = !this.descriptionShow
  }

  openModal(indice: number) {
    this.carouselImages = this.product.images
    this.currentIndex = indice + 1
    this.isModalOpen = true
  }

  closeModal() {
    this.isModalOpen = false
  }

  nextImage() {
    this.currentIndex = (this.currentIndex + 1) % this.carouselImages.length
  }

  prevImage() {
    this.currentIndex = (this.currentIndex - 1 + this.carouselImages.length) % this.carouselImages.length
  }

  constructor(
    private route: ActivatedRoute,
    private marketsService: MarketsService
  ) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnInit(): void {
    this.marketsService.getMarkets().subscribe((res: any) => {
      this.products = res

      this.route.queryParams.subscribe(params => {
        this.productName = params['name']

        if (this.productName) {
          this.product = this.products.find((p: any) => p.name.toUpperCase() === this.productName?.toUpperCase())
          this.product.highlights = JSON.parse(this.product.highlights)
        } else {
          this.product = {}
        }
      })
    })
  }

}
