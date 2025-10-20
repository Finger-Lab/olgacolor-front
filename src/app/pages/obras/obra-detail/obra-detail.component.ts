import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../components/header/header.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { FacadeSystemsService, FacadeSystem } from '../../../services/facade-systems.service';

@Component({
  selector: 'app-obra-detail',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './obra-detail.component.html',
  styleUrl: './obra-detail.component.scss'
})
export class ObraDetailComponent implements OnInit {
  protected obra = signal<FacadeSystem | null>(null);
  protected loading = signal<boolean>(true);
  protected error = signal<string | null>(null);
  protected imageError = signal<boolean>(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private facadeSystemsService: FacadeSystemsService
  ) {}

  ngOnInit() {
    // Debug: listar obras disponíveis
    this.facadeSystemsService.getFacadeSystems().subscribe({
      next: (obras) => {
        console.log('🎯 Debug - Todas as obras disponíveis:');
        obras.forEach((obra, index) => {
          console.log(`${index + 1}. ID: "${obra.id}" - Título: "${obra.title}"`);
        });
      }
    });

    this.route.params.subscribe(params => {
      const obraId = params['id'];
      console.log('🆔 ID da obra recebido na rota:', obraId);
      if (obraId) {
        this.loadObra(obraId);
      } else {
        this.error.set('ID da obra não encontrado');
        this.loading.set(false);
      }
    });
  }

  private async loadObra(id: string) {
    try {
      console.log('🔄 Iniciando carregamento da obra com ID:', id);
      this.loading.set(true);
      this.error.set(null);
      this.imageError.set(false);
      
      const obra = await this.facadeSystemsService.getFacadeSystemById(id);
      console.log('📋 Resultado da busca:', obra);
      
      if (obra) {
        console.log('✅ Definindo obra encontrada:', obra);
        console.log('🖼️ URL da imagem:', obra.imageUrl);
        console.log('🖼️ Tipo da URL:', typeof obra.imageUrl);
        console.log('🖼️ URL válida?:', !!obra.imageUrl);
        this.obra.set(obra);
      } else {
        console.log('❌ Obra não encontrada, definindo erro');
        this.error.set('Obra não encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar obra:', error);
      this.error.set('Erro ao carregar os dados da obra');
    } finally {
      console.log('🏁 Finalizando carregamento, loading = false');
      this.loading.set(false);
    }
  }

  voltarParaObras() {
    this.router.navigate(['/obras']);
  }

  onImageError() {
    console.log('❌ Erro ao carregar imagem da obra');
    this.imageError.set(true);
  }

  onImageLoad() {
    console.log('✅ Imagem da obra carregada com sucesso');
    this.imageError.set(false);
  }
}