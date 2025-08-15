import { Component } from '@angular/core';

@Component({
  selector: 'app-infrastructure',
  imports: [],
  templateUrl: './infrastructure.component.html',
  styleUrl: './infrastructure.component.scss'
})
export class InfrastructureComponent {
  imgCarouselSlider: any[] = [
    {
      src: 'assets/images/technology/jacutinga-olga.png'
    },
    {
      src: 'assets/images/technology/jacutinha-2.png'
    },
    {
      src: 'assets/images/technology/jacutinga-3.png'
    },
    {
      src: 'assets/images/technology/jacutinga-4.png'
    },
  ]

  currentIndex = 0
  itemsPerSlide = 1

  moveSlide(direction: number): void {  
    if (direction > 0) {
      this.currentIndex += this.itemsPerSlide
      if (this.currentIndex >= this.imgCarouselSlider.length) {
        this.currentIndex = 0
      }
    } else {
      this.currentIndex -= this.itemsPerSlide
      if (this.currentIndex < 0) {
        this.currentIndex = this.imgCarouselSlider.length - this.itemsPerSlide
      }
    }
  
    const translateXPercentage = (this.currentIndex / this.itemsPerSlide) * 100
    
    const carousel = document.querySelector('.carousel-slider') as HTMLElement
    carousel.style.transform = `translateX(-${translateXPercentage}%)`
  }
} 
