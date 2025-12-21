import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SafePipe } from '../../../shared/safe.pipe';
import { CatalogsService } from '../catalogs.service';
import { ICatalog } from '../catalog.interface';

@Component({
  selector: 'app-material-tecnico',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SafePipe
  ],
  templateUrl: './material-tecnico.component.html',
  styleUrls: ['./material-tecnico.component.scss']
})
export class MaterialTecnicoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalogsService = inject(CatalogsService);

  protected catalog: ICatalog | null = null;
  protected iframeUrl: string = '';
  protected specifications: any = null;
  protected testResults: any[] = [];

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const catalogId = this.route.snapshot.paramMap.get('id');
    if (catalogId) {
      this.loadCatalogData(catalogId);
    }
  }

  private loadCatalogData(id: string): void {
    this.catalogsService.find({}).subscribe(catalogs => {
      this.catalog = catalogs.find(c => c.id === id) || null;
      
      if (this.catalog) {
        this.loadCatalogDetails();
      } else {
        this.router.navigate(['/catalogos/produtos']);
      }
    });
  }

  private loadCatalogDetails(): void {
    if (!this.catalog) return;

    // Mapear URLs de iframe para cada catálogo (se disponível)
    const iframeMap: { [key: string]: string } = {
      '1': 'https://clientes.metries.com.br/olgacolor/janela.htm', // Slide Glass
      '2': 'https://clientes.metries.com.br/olgacolor/janela.htm', // Euro Glass
      // Adicione mais mapeamentos conforme necessário
    };

    this.iframeUrl = iframeMap[this.catalog.id] || '';

    // Carregar especificações técnicas baseadas no catálogo
    this.loadSpecifications();
    this.loadTestResults();
  }

  private loadSpecifications(): void {
    if (!this.catalog) return;

    // Especificações padrão - podem ser customizadas por catálogo
    this.specifications = {
      material: 'Alumínio anodizado',
      thickness: '3.2mm',
      finish: 'Polimento de alta qualidade',
      sealing: 'Sistema duplo com borrachas EPDM',
      glass: '4mm a 10mm',
      system: this.catalog.name
    };
  }

  private loadTestResults(): void {
    // Resultados de ensaios padrão - podem ser customizados por catálogo
    this.testResults = [
      { test: 'Permeabilidade ao Ar', result: 'Vazamento mín.', classification: 'Classe A3' },
      { test: 'Estanqueidade à Água', result: 'Sem vazamentos', classification: 'Classe E5' },
      { test: 'Resistência ao Vento', result: 'Deformação máx: 2.8mm', classification: 'Classe C4' },
      { test: 'Isolamento Acústico', result: 'Redução: 28dB', classification: 'Superior' }
    ];
  }

  protected openPdf(): void {
    if (this.catalog?.pdfUrl) {
      window.open(this.catalog.pdfUrl, '_blank');
    }
  }

  protected downloadPdf(): void {
    if (!this.catalog?.pdfUrl || !this.catalog?.name) return;
    
    try {
      const fileName = `${this.catalog.name.replace(/[^a-zA-Z0-9-_\s]/g, '_')}.pdf`;
      let downloadUrl = this.catalog.pdfUrl;
      
      if (downloadUrl.includes('firebasestorage.googleapis.com')) {
        const separator = downloadUrl.includes('?') ? '&' : '?';
        downloadUrl = `${downloadUrl}${separator}response-content-disposition=attachment;filename="${encodeURIComponent(fileName)}"`;
      }
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao fazer download do PDF:', error);
    }
  }
}

