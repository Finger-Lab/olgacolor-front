import { Component, CUSTOM_ELEMENTS_SCHEMA, signal, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { FacadeSystemsService, FacadeSystem } from '../../services/facade-systems.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-obras',
  imports: [HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './obras.component.html',
  styleUrl: './obras.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ObrasComponent implements OnInit {
  @ViewChild('brazilMapSvg') brazilMapSvg!: ElementRef;
  @ViewChild('obrasSection') obrasSection!: ElementRef;
  classScrolled: string = 'scrolled position-sticky';

  protected obras = signal<FacadeSystem[]>([]);
  protected obrasPorSistema = signal<{[key: string]: FacadeSystem[]}>({});
  protected sistemasDisponiveis = signal<string[]>([]);
  protected sistemaExpandido = signal<string | null>(null);
  
  protected estadoSelecionado = signal<string | null>(null);
  protected estadosDisponiveis = signal<string[]>([]);
  protected obrasPorEstado = signal<{[key: string]: FacadeSystem[]}>({});
  
  // Modal da imagem
  protected modalAberto = signal<boolean>(false);
  protected imagemModal = signal<string | null>(null);
  protected tituloModal = signal<string | null>(null);

  constructor(private facadeSystemsService: FacadeSystemsService) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnInit() {
    this.loadObras();
  }

  private loadObras() {
    this.facadeSystemsService.getFacadeSystems().subscribe({
      next: (obras) => {
        console.log('Obras carregadas:', obras.length);
        this.obras.set(obras);
        
        const sistemasMap: {[key: string]: FacadeSystem[]} = {};
        const estadosMap: {[key: string]: FacadeSystem[]} = {};
        
        obras.forEach(obra => {
          obra.system.forEach(sistema => {
            if (!sistemasMap[sistema]) {
              sistemasMap[sistema] = [];
            }
            sistemasMap[sistema].push(obra);
          });
          
          if (obra.location) {
            if (!estadosMap[obra.location]) {
              estadosMap[obra.location] = [];
            }
            estadosMap[obra.location].push(obra);
          }
        });
        
        this.obrasPorSistema.set(sistemasMap);
        this.obrasPorEstado.set(estadosMap);
        this.sistemasDisponiveis.set(Object.keys(sistemasMap).sort());
        this.estadosDisponiveis.set(Object.keys(estadosMap).sort());
        
        // Tentar configurar o mapa após carregar os dados
        setTimeout(() => {
          this.forceMapStyles();
        }, 1500);
      },
      error: (error) => {
        console.error('Erro ao carregar obras:', error);
      }
    });
  }

  onMapLoaded() {
    setTimeout(() => {
      this.setupMapInteractivity();
    }, 200);
    
    // Verificação adicional após 1 segundo
    setTimeout(() => {
      this.forceMapStyles();
    }, 1000);
  }

  private forceMapStyles() {
    const svgObject = this.brazilMapSvg?.nativeElement;
    if (!svgObject) {
      console.warn('SVG object não encontrado');
      return;
    }

    // Tentar acessar o documento do SVG
    let svgDoc = svgObject.contentDocument;
    
    if (!svgDoc) {
      // Se contentDocument não funcionar, tentar getSVGDocument
      try {
        svgDoc = (svgObject as any).getSVGDocument();
      } catch (e) {
        console.warn('Não foi possível acessar o documento SVG');
        return;
      }
    }

    if (svgDoc) {
      console.log('✅ Aplicando estilos no mapa do Brasil');
      const paths = svgDoc.querySelectorAll('path');
      
      paths.forEach((path: SVGPathElement) => {
        // Aplicar estilos base
        path.style.setProperty('fill', '#192636', 'important');
        path.style.setProperty('stroke', '#ffffff', 'important');
        path.style.setProperty('stroke-width', '2', 'important');
        path.style.setProperty('cursor', 'pointer', 'important');
        path.style.setProperty('transition', 'all 0.3s ease', 'important');
        
        const estadoId = path.id;
        const estadoNome = this.getEstadoNome(estadoId);
        
        if (estadoNome) {
          const temObras = this.obrasPorEstado()[estadoNome]?.length > 0;
          
          if (temObras) {
            path.classList.add('has-obras');
            path.style.setProperty('fill', '#4CAF50', 'important');
          }
          
          this.setupPathEvents(path, estadoNome);
          this.addHoverEffects(path);
        }
      });
    }
  }

  private setupMapInteractivity() {
    const svgObject = this.brazilMapSvg?.nativeElement;
    if (!svgObject || !svgObject.contentDocument) {
      console.warn('SVG não carregado ainda, tentando novamente...');
      // Se o SVG não carregou, tentar novamente
      setTimeout(() => this.forceMapStyles(), 500);
      return;
    }

    console.log('✅ Configurando interatividade do mapa');
    const svgDoc = svgObject.contentDocument;
    const paths = svgDoc.querySelectorAll('path');
    
    paths.forEach((path: SVGPathElement) => {
      const estadoId = path.id;
      const estadoNome = this.getEstadoNome(estadoId);
      
      if (estadoNome) {
        const temObras = this.obrasPorEstado()[estadoNome]?.length > 0;
        
        if (temObras) {
          path.classList.add('has-obras');
        }
        
        this.setupPathEvents(path, estadoNome);
        this.addHoverEffects(path);
      }
    });
  }

  private setupPathStyles(svgPath: SVGPathElement) {
    // Aplicar estilos base com força máxima
    svgPath.style.setProperty('fill', '#192636', 'important');
    svgPath.style.setProperty('stroke', '#ffffff', 'important');
    svgPath.style.setProperty('stroke-width', '2', 'important');
    svgPath.style.setProperty('cursor', 'pointer', 'important');
    svgPath.style.setProperty('transition', 'all 0.3s ease', 'important');
    
    // Se o estado tem obras, aplicar cor verde
    if (svgPath.classList.contains('has-obras')) {
      svgPath.style.setProperty('fill', '#4CAF50', 'important');
    }
    
    svgPath.addEventListener('mouseenter', () => {
      if (!svgPath.classList.contains('selected')) {
        if (svgPath.classList.contains('has-obras')) {
          svgPath.style.setProperty('fill', '#45a049', 'important');
        } else {
          svgPath.style.setProperty('fill', '#007bff', 'important');
        }
        svgPath.style.setProperty('stroke-width', '3', 'important');
      }
    });

    svgPath.addEventListener('mouseleave', () => {
      if (!svgPath.classList.contains('selected')) {
        if (svgPath.classList.contains('has-obras')) {
          svgPath.style.setProperty('fill', '#4CAF50', 'important');
        } else {
          svgPath.style.setProperty('fill', '#192636', 'important');
        }
        svgPath.style.setProperty('stroke-width', '2', 'important');
      }
    });
  }

  private setupPathEvents(svgPath: SVGPathElement, estadoNome: string) {
    svgPath.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      console.log(`🎯 Clique detectado no estado: ${estadoNome}`);
      this.filtrarPorEstado(estadoNome);
    });
    
    // Adicionar também o evento de toque para dispositivos móveis
    svgPath.addEventListener('touchend', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.filtrarPorEstado(estadoNome);
    });
  }

  private addHoverEffects(svgPath: SVGPathElement) {
    svgPath.addEventListener('mouseenter', () => {
      if (!svgPath.classList.contains('selected')) {
        if (svgPath.classList.contains('has-obras')) {
          svgPath.style.setProperty('fill', '#45a049', 'important');
        } else {
          svgPath.style.setProperty('fill', '#007bff', 'important');
        }
        svgPath.style.setProperty('stroke-width', '3', 'important');
      }
    });

    svgPath.addEventListener('mouseleave', () => {
      if (!svgPath.classList.contains('selected')) {
        if (svgPath.classList.contains('has-obras')) {
          svgPath.style.setProperty('fill', '#4CAF50', 'important');
        } else {
          svgPath.style.setProperty('fill', '#192636', 'important');
        }
        svgPath.style.setProperty('stroke-width', '2', 'important');
      }
    });
  }

  private getEstadoNome(estadoId: string): string | null {
    const estadosMap: {[key: string]: string} = {
      'BR-AC': 'Acre', 'BR-AL': 'Alagoas', 'BR-AP': 'Amapá', 'BR-AM': 'Amazonas',
      'BR-BA': 'Bahia', 'BR-CE': 'Ceará', 'BR-DF': 'Distrito Federal', 'BR-ES': 'Espírito Santo',
      'BR-GO': 'Goiás', 'BR-MA': 'Maranhão', 'BR-MT': 'Mato Grosso', 'BR-MS': 'Mato Grosso do Sul',
      'BR-MG': 'Minas Gerais', 'BR-PA': 'Pará', 'BR-PB': 'Paraíba', 'BR-PR': 'Paraná',
      'BR-PE': 'Pernambuco', 'BR-PI': 'Piauí', 'BR-RJ': 'Rio de Janeiro', 'BR-RN': 'Rio Grande do Norte',
      'BR-RS': 'Rio Grande do Sul', 'BR-RO': 'Rondônia', 'BR-RR': 'Roraima', 'BR-SC': 'Santa Catarina',
      'BR-SP': 'São Paulo', 'BR-SE': 'Sergipe', 'BR-TO': 'Tocantins'
    };
    
    return estadosMap[estadoId] || null;
  }

  private addStateLabels(svgDoc: Document) {
    const svgEl = svgDoc.querySelector('svg');
    if (!svgEl) return;

    // Remover siglas existentes para evitar duplicação
    const existingLabels = svgEl.querySelectorAll('text.state-label');
    existingLabels.forEach(label => label.remove());

    // Coordenadas corrigidas do centro de cada estado
    const statePositions: { [key: string]: { x: number, y: number } } = {
      'BR-AC': { x: 290, y: 450 },  // Acre
      'BR-AL': { x: 625, y: 400 },  // Alagoas
      'BR-AP': { x: 490, y: 180 },  // Amapá
      'BR-AM': { x: 320, y: 320 },  // Amazonas
      'BR-BA': { x: 560, y: 400 },  // Bahia
      'BR-CE': { x: 580, y: 330 },  // Ceará
      'BR-DF': { x: 520, y: 420 },  // Distrito Federal
      'BR-ES': { x: 580, y: 470 },  // Espírito Santo
      'BR-GO': { x: 500, y: 420 },  // Goiás
      'BR-MA': { x: 530, y: 300 },  // Maranhão
      'BR-MT': { x: 440, y: 390 },  // Mato Grosso
      'BR-MS': { x: 460, y: 460 },  // Mato Grosso do Sul
      'BR-MG': { x: 530, y: 450 },  // Minas Gerais
      'BR-PA': { x: 430, y: 280 },  // Pará
      'BR-PB': { x: 615, y: 350 },  // Paraíba
      'BR-PR': { x: 500, y: 510 },  // Paraná
      'BR-PE': { x: 595, y: 370 },  // Pernambuco
      'BR-PI': { x: 540, y: 350 },  // Piauí
      'BR-RJ': { x: 560, y: 485 },  // Rio de Janeiro
      'BR-RN': { x: 605, y: 320 },  // Rio Grande do Norte
      'BR-RS': { x: 480, y: 570 },  // Rio Grande do Sul
      'BR-RO': { x: 360, y: 400 },  // Rondônia
      'BR-RR': { x: 350, y: 180 },  // Roraima
      'BR-SC': { x: 510, y: 540 },  // Santa Catarina
      'BR-SP': { x: 510, y: 480 },  // São Paulo
      'BR-SE': { x: 615, y: 380 },  // Sergipe
      'BR-TO': { x: 500, y: 370 }   // Tocantins
    };

    const svgElement = svgDoc.querySelector('svg');
    if (!svgElement) return;

    Object.entries(statePositions).forEach(([stateId, position]) => {
      const sigla = stateId.replace('BR-', '');
      
      // Criar elemento de texto
      const textElement = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'text');
      textElement.setAttribute('x', position.x.toString());
      textElement.setAttribute('y', position.y.toString());
      textElement.setAttribute('text-anchor', 'middle');
      textElement.setAttribute('dominant-baseline', 'middle');
      textElement.setAttribute('font-family', 'Arial, sans-serif');
      textElement.setAttribute('font-size', '10');
      textElement.setAttribute('font-weight', 'bold');
      textElement.setAttribute('fill', '#ffffff');
      textElement.setAttribute('pointer-events', 'none');
      textElement.setAttribute('class', 'state-label');
      textElement.textContent = sigla;
      
      svgEl.appendChild(textElement);
    });
  }

  debugMapClicks() {
    console.log('🐛 Iniciando debug do mapa...');
    
    const svgObject = this.brazilMapSvg?.nativeElement;
    if (!svgObject) {
      console.error('❌ SVG object não encontrado');
      return;
    }
    
    console.log('✅ SVG object encontrado:', svgObject);
    
    let svgDoc = svgObject.contentDocument;
    if (!svgDoc) {
      try {
        svgDoc = (svgObject as any).getSVGDocument();
      } catch (e) {
        console.error('❌ Não foi possível acessar documento SVG');
        return;
      }
    }
    
    if (svgDoc) {
      const paths = svgDoc.querySelectorAll('path');
      console.log(`✅ Encontrados ${paths.length} paths no SVG`);
      
      // Listar TODOS os IDs dos paths para descobrir o padrão
      console.log('📋 IDs de todos os paths:');
      paths.forEach((path: SVGPathElement, index: number) => {
        const id = path.id;
        const title = path.getAttribute('title');
        console.log(`${index + 1}. ID: "${id}" | Title: "${title}"`);
      });
      
      // Testar alguns estados específicos com prefixo BR-
      const testStates = ['BR-SP', 'BR-RJ', 'BR-MG', 'BR-RS', 'BR-PR'];
      testStates.forEach(stateId => {
        const path = svgDoc.getElementById(stateId);
        if (path) {
          console.log(`✅ Estado ${stateId} encontrado:`, path);
          const estadoNome = this.getEstadoNome(stateId.replace('BR-', ''));
          console.log(`✅ Nome do estado: ${estadoNome}`);
        } else {
          console.error(`❌ Estado ${stateId} não encontrado`);
        }
      });
      
      // Forçar reconfiguração
      this.forceMapStyles();
    }
  }

  filtrarPorEstado(estado: string) {
    console.log(`🔍 Filtrando por estado: ${estado}`);
    this.estadoSelecionado.set(estado);
    this.sistemaExpandido.set(null);
    this.updateMapSelection(estado);
    this.scrollToObras();
    console.log(`✅ Estado selecionado atualizado para: ${this.estadoSelecionado()}`);
  }

  private updateMapSelection(estadoSelecionado: string) {
    const svgObject = this.brazilMapSvg?.nativeElement;
    if (!svgObject || !svgObject.contentDocument) return;

    const svgDoc = svgObject.contentDocument;
    const paths = svgDoc.querySelectorAll('path');
    
    paths.forEach((path: SVGPathElement) => {
      const estadoNome = this.getEstadoNome(path.id);
      
      if (estadoNome === estadoSelecionado) {
        path.classList.add('selected');
        path.style.setProperty('fill', '#FF6B35', 'important');
        path.style.setProperty('stroke-width', '4', 'important');
      } else {
        path.classList.remove('selected');
        if (path.classList.contains('has-obras')) {
          path.style.setProperty('fill', '#4CAF50', 'important');
        } else {
          path.style.setProperty('fill', '#192636', 'important');
        }
        path.style.setProperty('stroke-width', '2', 'important');
      }
    });
  }

  getSistemasDisponiveisFiltrados(): string[] {
    const estadoAtual = this.estadoSelecionado();
    
    if (!estadoAtual) {
      return this.sistemasDisponiveis();
    }
    
    const obrasDoEstado = this.obrasPorEstado()[estadoAtual] || [];
    const sistemasNoEstado = new Set<string>();
    
    obrasDoEstado.forEach(obra => {
      obra.system.forEach(sistema => {
        sistemasNoEstado.add(sistema);
      });
    });
    
    return Array.from(sistemasNoEstado).sort();
  }

  getObrasPorSistema(sistema: string): FacadeSystem[] {
    const estadoAtual = this.estadoSelecionado();
    
    // Se tem estado selecionado, ignora o filtro de sistema (filtro OU)
    if (estadoAtual) {
      return this.obrasPorEstado()[estadoAtual] || [];
    }
    
    // Se não tem estado, mostra obras do sistema
    return this.obrasPorSistema()[sistema] || [];
  }

  getNumeroObrasPorEstado(estado: string): number {
    return this.obrasPorEstado()[estado]?.length || 0;
  }

  toggleSistema(sistema: string) {
    const sistemaAtual = this.sistemaExpandido();
    
    if (sistemaAtual === sistema) {
      this.sistemaExpandido.set(null);
    } else {
      this.sistemaExpandido.set(sistema);
      this.estadoSelecionado.set(null); // Limpar estado quando seleciona sistema
      this.clearMapSelection(); // Limpar seleção do mapa
      this.scrollToObras();
    }
  }

  limparFiltros() {
    this.estadoSelecionado.set(null);
    this.sistemaExpandido.set(null);
    this.clearMapSelection();
  }

  getSistemaLogo(sistema: string): string {
    const logoMap: {[key: string]: string} = {
      'AGLO': 'assets/images/sistemas/Aglo 2.0 NOVO.png',
      'AGLO 2.0': 'assets/images/sistemas/Aglo 2.0 NOVO.png',
      'AGLO 2.2': 'assets/images/sistemas/Aglo 2.2OC NOVO.png',
      'AGLO 2.5': 'assets/images/sistemas/Aglo 2.5 NOVO.png',
      'AGLO 3.2': 'assets/images/sistemas/Aglo 3.2OC NOVO.png',
      'LOCK': 'assets/images/sistemas/LOCK SL NOVO.png',
      'Lock': 'assets/images/sistemas/LOCK SL NOVO.png',
      'LOCK SL': 'assets/images/sistemas/LOCK SL NOVO.png',
      'Lock SL': 'assets/images/sistemas/LOCK SL NOVO.png',
      'Lock/SL': 'assets/images/sistemas/LOCK SL NOVO.png',
      'LOCK/SL': 'assets/images/sistemas/LOCK SL NOVO.png',
      'lock/sl': 'assets/images/sistemas/LOCK SL NOVO.png',
      'lock sl': 'assets/images/sistemas/LOCK SL NOVO.png',
      'Lock / SL': 'assets/images/sistemas/LOCK SL NOVO.png',
      'LOCK / SL': 'assets/images/sistemas/LOCK SL NOVO.png',
      'LOCK COLATO': 'assets/images/sistemas/LOCK SL COLATO.png',
      'Lock Colato': 'assets/images/sistemas/LOCK SL COLATO.png',
      'GRID': 'assets/images/sistemas/GRID NOVO.png',
      'Grid': 'assets/images/sistemas/GRID NOVO.png',
      'GRID COLATO': 'assets/images/sistemas/GRID COLATO.png',
      'Grid Colato': 'assets/images/sistemas/GRID COLATO.png',
      'Delicato': 'assets/images/sistemas/Delicato Due NOVO.png',
      'Imponenza': 'assets/images/sistemas/Imponenza NOVO.png',
      'Neograd': 'assets/images/sistemas/Neograd.png',
      'Colato': 'assets/images/sistemas/LOCK SL COLATO.png',
      'Olga Sierra': 'assets/images/sistemas/LOGOTIPO OLGA SIERRA_final.png',
      'Olglass': 'assets/images/sistemas/Olglass NOVO.png',
      'Integrada': 'assets/images/sistemas/Integrada.png',
      'Linha Industrial': 'assets/images/sistemas/Linha Industrial.png',
      'Sistema Olga': 'assets/images/sistemas/SISTEMA OLGA NOVO.png',
      'Levitare': 'assets/images/sistemas/Logotipo Levitare.png',
      'Implementos Rodoviários': 'assets/images/sistemas/Logo Implementos Rodoviários_2023.png'
    };
    
    // Primeiro tenta buscar exatamente como está
    if (logoMap[sistema]) {
      return logoMap[sistema];
    }
    
    // Se não encontrar, tenta algumas variações comuns para Lock/SL
    const sistemaLower = sistema.toLowerCase();
    if (sistemaLower.includes('lock') && sistemaLower.includes('sl')) {
      return 'assets/images/sistemas/LOCK SL NOVO.png';
    }
    
    // Fallback para o logo do Sistema Olga se não encontrar nada
    return 'assets/images/sistemas/SISTEMA OLGA NOVO.png';
  }

  private scrollToObras() {
    // Aguarda um pouco para garantir que o DOM foi atualizado
    setTimeout(() => {
      if (this.obrasSection) {
        this.obrasSection.nativeElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  }

  getObrasFiltradas(): FacadeSystem[] {
    const estadoAtual = this.estadoSelecionado();
    const sistemaAtual = this.sistemaExpandido();
    
    // Se tem estado selecionado, mostra obras do estado
    if (estadoAtual) {
      return this.obrasPorEstado()[estadoAtual] || [];
    }
    
    // Se tem sistema selecionado, mostra obras do sistema
    if (sistemaAtual) {
      return this.obrasPorSistema()[sistemaAtual] || [];
    }
    
    // Se não tem filtro, retorna array vazio
    return [];
  }

  getTituloFiltro(): string {
    const estadoAtual = this.estadoSelecionado();
    const sistemaAtual = this.sistemaExpandido();
    
    if (estadoAtual) {
      return `Obras realizadas no estado de ${estadoAtual}`;
    }
    
    if (sistemaAtual) {
      return `Obras realizadas com ${sistemaAtual}`;
    }
    
    return 'Obras realizadas';
  }

  abrirModal(imageUrl: string, titulo: string) {
    this.imagemModal.set(imageUrl);
    this.tituloModal.set(titulo);
    this.modalAberto.set(true);
    
    // Prevenir scroll do body quando modal está aberto
    document.body.style.overflow = 'hidden';
  }

  fecharModal() {
    this.modalAberto.set(false);
    this.imagemModal.set(null);
    this.tituloModal.set(null);
    
    // Restaurar scroll do body
    document.body.style.overflow = 'auto';
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapePress(event: KeyboardEvent) {
    if (this.modalAberto()) {
      this.fecharModal();
    }
  }

  private clearMapSelection() {
    const svgObject = this.brazilMapSvg?.nativeElement;
    if (!svgObject || !svgObject.contentDocument) return;

    const svgDoc = svgObject.contentDocument;
    const paths = svgDoc.querySelectorAll('path');
    
    paths.forEach((path: SVGPathElement) => {
      path.classList.remove('selected');
      if (path.classList.contains('has-obras')) {
        path.style.setProperty('fill', '#4CAF50', 'important');
      } else {
        path.style.setProperty('fill', '#192636', 'important');
      }
      path.style.setProperty('stroke-width', '2', 'important');
    });
  }
}
