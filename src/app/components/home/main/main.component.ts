import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  imports: [TranslateModule, CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mainVideo', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  
  isVideoLoaded = false;

  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('pt');
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setupVideo();
    }, 100);
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  private setupVideo() {
    const video = this.videoElement?.nativeElement;
    if (video) {
      // Garantir que o vídeo está mudo para permitir autoplay
      video.muted = true;
      video.volume = 0;
      
      // Setup dos event listeners
      video.addEventListener('loadeddata', () => this.handleVideoReady());
      video.addEventListener('canplay', () => this.handleVideoReady());
      video.addEventListener('canplaythrough', () => this.handleVideoReady());
      
      // Forçar play se já estiver carregado
      if (video.readyState >= 2) {
        this.handleVideoReady();
      }
    }
  }

  private handleVideoReady() {
    if (!this.isVideoLoaded) {
      this.isVideoLoaded = true;
      const video = this.videoElement?.nativeElement;
      if (video) {
        // Garantir que está mudo e forçar play
        video.muted = true;
        video.volume = 0;
        
        // Tentar play múltiplas vezes se necessário
        const attemptPlay = () => {
          video.play().catch(error => {
            console.log('Tentativa de autoplay:', error.message);
            // Tentar novamente após um curto delay
            setTimeout(() => {
              if (video.paused) {
                video.muted = true;
                video.play().catch(e => console.log('Autoplay definitivamente bloqueado:', e.message));
              }
            }, 100);
          });
        };
        
        attemptPlay();
      }
    }
  }

  onVideoLoaded() {
    this.handleVideoReady();
  }

  onVideoError() {
    console.error('Erro ao carregar o vídeo');
  }
}
