import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { FilterParams, ICatalog } from './catalog.interface';

@Injectable({ providedIn: 'root' })
export class CatalogsService {
  public selectedCatalog = signal<ICatalog | null>(null);
  public categorySelected = signal<string | null>(null);
  public categories: string[] = [];

  private filteredCatalogs = new BehaviorSubject<ICatalog[]>([]);
  private allCatalogs: ICatalog[] = [
    {
      id: '1',
      name: 'Slide Glass',
    //   description: 'Linha completa de portas em alumínio para todas as necessidades',
      category: 'VIDRAÇARIA',
      thumbnailUrl: 'assets/images/catalogs/slideglass.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2FSlideglass.pdf?alt=media&token=792ec7be-cf06-4875-95da-5450e813b4fc',
      order: 1,
      createdAt: '2025-09-01'
    },
    {
      id: '2',
      name: 'Euro Glass',
    //   description: 'Soluções em janelas para projetos residenciais e comerciais',
      category: 'VIDRAÇARIA',
      thumbnailUrl: 'assets/images/catalogs/glazing_systems_2.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Feuroglass.pdf?alt=media&token=c7aa0ac0-5d57-4405-8a12-367699698bc6',
      order: 2,
      createdAt: '2025-09-02'
    },
    {
      id: '3',
      name: 'Box + engenharia ',
    //   description: 'Sistemas de guarda-corpo modernos e seguros para residências',
      category: 'VIDRAÇARIA',
      thumbnailUrl: 'assets/images/catalogs/unico-box.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2FBox_Engenharia.pdf?alt=media&token=2c62fd1d-f229-4b92-99e5-8b9ab8c0f6d9',
      order: 3,
      createdAt: '2025-09-03'
    },
    {
      id: '4',
      name: 'Portas deslizantes',
    //   description: 'Soluções inovadoras para fachadas comerciais e corporativas',
      category: 'VIDRAÇARIA',
      thumbnailUrl: 'assets/images/catalogs/glazing_systems_4.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Fcatalogo_TMC_Olgacolor.pdf?alt=media&token=8c446884-2b93-41f6-bbe0-b413940080b6',
      order: 4,
      createdAt: '2025-09-04'
    },
    {
      id: '5',
      name: 'Envidraçamento',
    //   description: 'Catálogo técnico completo de perfis estruturais em alumínio',
      category: 'VIDRAÇARIA',
      thumbnailUrl: 'assets/images/catalogs/glazing_systems_5.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Fenvidracamento.pdf?alt=media&token=1bdc5e5f-3ec3-4387-bfd4-e7db1dc755bf',
      order: 5,
      createdAt: '2025-09-05'
    },
    {
      id: '7',
      name: 'Olglass',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'VIDRAÇARIA',
      thumbnailUrl: 'assets/images/catalogs/glazing_systems_6.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2FCatalogo_Tecnico_Olglass.pdf?alt=media&token=9ae18d55-8f57-4b02-994c-2c9c4ec0940a',
      order: 6,
      createdAt: '2025-09-06'
    },
     {
      id: '8',
      name: 'Linha Moveleira',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'MOVELARIA',
      thumbnailUrl: 'assets/images/catalogs/furniture_systems_1.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Fcatalogo-movelaria_web.pdf?alt=media&token=9f84755c-ddb5-4c01-8934-e68fbfddd1b7',
      order: 6,
      createdAt: '2025-09-06'
    },
     {
      id: '9',
      name: 'Infinite line',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'MOVELARIA',
      thumbnailUrl: 'assets/images/catalogs/furniture_systems_2.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Finfinite-line.pdf?alt=media&token=ad47d73b-2abd-4b9f-a0f8-0ca9bcfea72e',
      order: 6,
      createdAt: '2025-09-06'
    },
     {
      id: '10',
      name: 'Automação',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'INDUSTRIAL',
      thumbnailUrl: 'assets/images/catalogs/industrial_line_2.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Fautomacao.pdf?alt=media&token=ac22e5a2-b9a7-4040-a7a4-488b1ad61c2f',
      order: 6,
      createdAt: '2025-09-06'
    },
    {
      id: '11',
      name: 'Implementos Rodoviários',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'INDUSTRIAL',
      thumbnailUrl: 'assets/images/catalogs/industrial_line_1.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Fimplementos.pdf?alt=media&token=0c61739c-2b83-4df2-89c6-a4e438d167f9',
      order: 6,
      createdAt: '2025-09-06'
    },
    {
      id: '12',
      name: 'Sistema Aglo 2.0',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'RESIDENCIAL AGLO',
      thumbnailUrl: 'assets/images/catalogs/aglo2.0.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Fportas-janelas%2Faglo%2Fcatalogo-AGLO2.0-web.pdf?alt=media&token=9a77ee87-0d69-4115-ad6e-cbe58a2724ef',
      order: 6,
      createdAt: '2025-09-06'
    },
    {
      id: '13',
      name: 'Sistema Aglo 2.5 OC',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'RESIDENCIAL AGLO',
      thumbnailUrl: 'assets/images/catalogs/aglo2.5oc.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Fportas-janelas%2Faglo%2FCat%C3%A1logo%20Aglo%202.5Oc.pdf?alt=media&token=d33a99c3-ba33-460e-b3af-62cd26ef510c',
      order: 6,
      createdAt: '2025-09-06'
    },
    {
      id: '14',
      name: 'Sistema Aglo 2.5',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'RESIDENCIAL AGLO',
      thumbnailUrl: 'assets/images/catalogs/aglo2.5.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Fportas-janelas%2Faglo%2Fcatalogo-AGLO2.5-web.pdf?alt=media&token=31d86884-c94f-4ac9-abf4-23a72788bb56',
      order: 6,
      createdAt: '2025-09-06'
    },
    {
      id: '15',
      name: 'Sistema Aglo 2.2 OC',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'RESIDENCIAL AGLO',
      thumbnailUrl: 'assets/images/catalogs/aglo2.2oc.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Fportas-janelas%2Faglo%2Faglo2.2oc.pdf?alt=media&token=a220431f-7932-4c0a-972f-3e5d619465ec',
      order: 6,
      createdAt: '2025-09-06'
    },
    {
      id: '16',
      name: 'Sistema Aglo 3.2',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'RESIDENCIAL AGLO',
      thumbnailUrl: 'assets/images/catalogs/aglo3.2.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Fportas-janelas%2Faglo%2Fcatalogo-AGLO3.2-web.pdf?alt=media&token=3a653c97-3253-4312-98dc-0d0676612513',
      order: 6,
      createdAt: '2025-09-06'
    },
    {
      id: '17',
      name: 'Sistema Lock/CL',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'RESIDENCIAL LOCK',
      thumbnailUrl: 'assets/images/catalogs/lockcl.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Fportas-janelas%2Flock%2FCat%C3%A1logo_Lock_CL.pdf?alt=media&token=17618c63-c42b-47b9-b109-9415cd57e1af',
      order: 6,
      createdAt: '2025-09-06'
    },
    {
      id: '18',
      name: 'Sistema Lock/HD e Lock/S',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'RESIDENCIAL LOCK',
      thumbnailUrl: 'assets/images/catalogs/lock-hds.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Fportas-janelas%2Flock%2FCat%C3%A1logo%20T%C3%A9cnico%20-%20Lock%20HD%20e%20S.pdf?alt=media&token=d0ac8f01-e31d-4801-93a2-05f5210542df',
      order: 6,
      createdAt: '2025-09-06'
    },
    {
      id: '19',
      name: 'Sistema Lock/SL',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'RESIDENCIAL LOCK',
      thumbnailUrl: 'assets/images/catalogs/unicosl.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Fportas-janelas%2Flock%2FCat%C3%A1logo_Lock_SL.pdf?alt=media&token=2732e058-208a-48a1-873d-88016205f1f5',
      order: 6,
      createdAt: '2025-09-06'
    },
    {
      id: '20',
      name: 'Sistema Lock/L',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'RESIDENCIAL LOCK',
      thumbnailUrl: 'assets/images/catalogs/lock-l.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Fportas-janelas%2Flock%2FCat%C3%A1logo%20Lock%20L%202024.pdf?alt=media&token=89829663-47c4-4ac8-809c-f14804d72f95',
      order: 6,
      createdAt: '2025-09-06'
    },
    {
      id: '21',
      name: 'Sistema Delicato',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'MINIMALISTA',
      thumbnailUrl: 'assets/images/catalogs/unico-delicato.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Fportas-janelas%2Fminimalista%2FCatalogo-Delicato-2022.pdf?alt=media&token=36234117-2b7b-4d22-99b4-b78510bc3b32',
      order: 6,
      createdAt: '2025-09-06'
    },
    {
      id: '22',
      name: 'Sistema Delicato³',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'MINIMALISTA',
      thumbnailUrl: 'assets/images/catalogs/delicato3.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Fportas-janelas%2Fminimalista%2FCat%C3%A1logo%20T%C3%A9cnico%20interativo%20-%20Delicato%C2%B3.pdf?alt=media&token=1e26c85c-3446-4b78-a400-f13f88e4468b',
      order: 6,
      createdAt: '2025-09-06'
    },
    
    {
      id: '23',
      name: 'Vidro Colado',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'VIDRO COLADO',
      thumbnailUrl: 'assets/images/catalogs/unico-colato.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Fportas-janelas%2Fcolato%2Fcatalogo-COLATO-web.pdf?alt=media&token=670ae40d-fee8-4ac8-b85b-e9114b13fdb1',
      order: 6,
      createdAt: '2025-09-06'
    },
    {
      id: '24',
      name: 'integrada',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'INTEGRADO',
      thumbnailUrl: 'assets/images/catalogs/unico-integrada.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Fportas-janelas%2Fsistema-integrado%2Fcatalogo-INTEGRADA-web.pdf?alt=media&token=8e9fa582-8377-40d3-b586-2e02fc81b461',
      order: 6,
      createdAt: '2025-09-06'
    },
    {
      id: '25',
      name: 'Olga Sierra',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'JANELAS E PORTAS ARTICULADAS',
      thumbnailUrl: 'assets/images/catalogs/unico-sierra.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Fportas-janelas%2Farticulados%2FCat%C3%A1logo_T%C3%A9cnico_Olga%20Sierra.pdf?alt=media&token=6c199da3-be50-4efb-b288-5ce7bb9f1ffc',
      order: 6,
      createdAt: '2025-09-06'
    },
    {
      id: '26',
      name: 'Imponenza',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'FACHADAS',
      thumbnailUrl: 'assets/images/catalogs/unico-imponenza.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Ffachadas%2FCat%C3%A1logo%20T%C3%A9cnico%20-%20Imponenza.pdf?alt=media&token=2a74572a-5cf0-4194-b870-398ad2201aef',
      order: 6,
      createdAt: '2025-09-06'
    },
    {
      id: '27',
      name: 'Sistem Grid',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'FACHADAS',
      thumbnailUrl: 'assets/images/catalogs/unico-grid.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Ffachadas%2Fcatalogo-Fachada-Gridluk-web.pdf?alt=media&token=46a01bc4-2f95-40e0-8f68-ad6736211ca4',
      order: 6,
      createdAt: '2025-09-06'
    },
    {
      id: '28',
      name: 'Stick',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'FACHADAS',
      thumbnailUrl: 'assets/images/catalogs/Stick.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Ffachadas%2Fcatalogo-Fachada-STICK-web.pdf?alt=media&token=56122b91-4c25-4d2f-bfa9-482c55ccabba',
      order: 6,
      createdAt: '2025-09-06'
    },
    {
      id: '29',
      name: 'Fachada Unik',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'FACHADAS',
      thumbnailUrl: 'assets/images/catalogs/Unik.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Ffachadas%2Fcatalogo-UNIK-web.pdf?alt=media&token=73c1c367-9fa4-44eb-b19c-f6692e367669',
      order: 6,
      createdAt: '2025-09-06'
    },
    {
      id: '30',
      name: 'Evo Stick',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'FACHADAS',
      thumbnailUrl: 'assets/images/catalogs/evo-stick.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Ffachadas%2FCat%C3%A1logo_T%C3%A9cnico_Evostick.pdf?alt=media&token=75feb1cd-1180-4db4-b4e1-1447dce802cf',
      order: 6,
      createdAt: '2025-09-06'
    },
    {
      id: '31',
      name: 'Sistema Neograd',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'GUARDA-CORPO',
      thumbnailUrl: 'assets/images/catalogs/uniconeograd.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Fguarda-corpo%2FCat%C3%A1logo_Neograd_Olgacolor.pdf?alt=media&token=986814ef-53a4-4428-a47c-8b46ff03399d',
      order: 6,
      createdAt: '2025-09-06'
    },
    {
      id: '32',
      name: 'Sistema Linea Glass',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'GUARDA-CORPO',
      thumbnailUrl: 'assets/images/catalogs/linea-glass.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Fguarda-corpo%2FCat%C3%A1logo_Linea_Glass_Olgacolor.pdf?alt=media&token=c66737af-3dff-49b9-82cc-22986994fc55',
      order: 6,
      createdAt: '2025-09-06'
    },
    {
      id: '33',
      name: 'Perfis Tabelados',
    //   description: 'Soluções completas em alumínio para projetos residenciais',
      category: 'TABELADOS',
      thumbnailUrl: 'assets/images/catalogs/tabelados.png',
      pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/olgacolor-5ed0f.firebasestorage.app/o/catalogs%2Ftabelados%2FCatalogo-tabelados-Olgacolor.pdf?alt=media&token=7e5db782-2b32-4623-a467-faf1f7b1a965',
      order: 6,
      createdAt: '2025-09-06'
    },
    
  ];

  constructor() {
    // Initialize filtered catalogs
    this.filteredCatalogs.next(this.allCatalogs);
    
    // Initialize categories from actual catalog data
    this.categories = [...new Set(this.allCatalogs.map(catalog => catalog.category))].sort();
  }

  get catalogs$(): Observable<ICatalog[]> {
    return this.filteredCatalogs.asObservable();
  }

  find(params: FilterParams = {}): Observable<ICatalog[]> {
    this.applyFilters(params);
    return from([this.filteredCatalogs.value]);
  }

  filterByCategories(categories: string[]) {
    if (!categories.length) {
      this.filteredCatalogs.next(this.allCatalogs);
      return;
    }

    const filtered = this.allCatalogs.filter(catalog => 
      categories.includes(catalog.category)
    );
    this.filteredCatalogs.next(filtered);
  }

  sortCatalogs(sortBy: 'name' | 'date') {
    const sorted = [...this.filteredCatalogs.value];
    
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    this.filteredCatalogs.next(sorted);
  }

  resetFilters() {
    this.filteredCatalogs.next(this.allCatalogs);
  }

  private applyFilters(params: FilterParams) {
    let filtered = [...this.allCatalogs];

    // Aplicar filtro de busca
    if (params.search?.trim()) {
      const searchTerm = params.search.toLowerCase().trim();
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm) || 
        (doc.description || '').toLowerCase().includes(searchTerm) ||
        doc.category.toLowerCase().includes(searchTerm)
      );
    }

    // Aplicar filtro de categoria
    if (params.category?.trim()) {
      const categoryTerm = params.category.toLowerCase().trim();
      filtered = filtered.filter(doc => doc.category.toLowerCase() === categoryTerm);
    }

    // Ordenar por order se existir, depois por nome
    filtered.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return a.name.localeCompare(b.name);
    });

    console.log('Filtered catalogs:', filtered); // Para debug
    this.filteredCatalogs.next(filtered);
  }
}
