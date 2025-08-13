import { Routes } from '@angular/router';
import { AdminGuard } from './auth/admin.guard';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'pagina-inicial'
    },
    {
        path: 'pagina-inicial',
        loadComponent: () => import('./pages/home/home.component').then(mod => mod.HomeComponent)
    },
    {
        path: 'tecnologia',
        loadComponent: () => import('./pages/technology/technology.component').then(mod => mod.TechnologyComponent)
    },
    {
        path: 'politica-qualidade',
        loadComponent: () => import('./pages/quality-policy/quality-policy.component').then(c => c.QualityPolicyComponent)
    },
    {
        path: 'processos-producao',
        loadComponent: () => import('./pages/processes-production/processes-production.component').then(mod => mod.ProcessesProductionComponent)
    },
    {
        path: 'processos-producao/extrusao',
        loadComponent: () => import('./pages/processes-production/extrusion/extrusion.component').then(mod => mod.ExtrusionComponent)
    },
    {
        path: 'processos-producao/anodizacao',
        loadComponent: () => import('./pages/processes-production/anodizing/anodizing.component').then(mod => mod.AnodizingComponent)
    },
    {
        path: 'processos-producao/pintura',
        loadComponent: () => import('./pages/processes-production/painting/painting.component').then(mod => mod.PaintingComponent)
    },
    {
        path: 'processos-producao/jateamento',
        loadComponent: () => import('./pages/processes-production/blasting/blasting.component').then(mod => mod.BlastingComponent)
    },
    {
        path: 'processos-producao/polimento',
        loadComponent: () => import('./pages/processes-production/polishing/polishing.component').then(mod => mod.PolishingComponent)
    },
    {
        path: 'processos-producao/usinagem',
        loadComponent: () => import('./pages/processes-production/machining/machining.component').then(mod => mod.MachiningComponent)
    },
    {
        path: 'mercados',
        loadComponent: () => import('./pages/markets/markets.component').then(mod => mod.MarketsComponent)
    },
    {
        path: 'mercados/construcao-civil',
        loadComponent: () => import('./pages/civil-construction/civil-construction.component').then(mod => mod.CivilConstructionComponent)
    },
    {
        path: 'mercados/envidracamento',
        loadComponent: () => import('./pages/glazing/glazing.component').then(mod => mod.GlazingComponent)
    },
    {
        path: 'mercados/linha-moveleira',
        loadComponent: () => import('./pages/furniture-line/furniture-line.component').then(mod => mod.FurnitureLineComponent)
    },
    {
        path: 'mercados/linha-industrial',
        loadComponent: () => import('./pages/industrial-line/industrial-line.component').then(mod => mod.IndustrialLineComponent)
    },
    // apenas admin
    {
        path: 'mercados/adicionar-mercados',
        canActivate: [AdminGuard],
        data: { roles: ['Admin'] },
        loadComponent: () => import('./pages/markets/add-markets/add-markets.component').then(mod => mod.AddMarketsComponent)
    },
    // apenas users
    {
        path: 'mercados/categorias',
        canActivate: [AdminGuard],
        data: { roles: ['Admin', 'User'] },
        loadComponent: () => import('./pages/markets/categories/categories.component').then(mod => mod.CategoriesComponent)
    },
    {
        path: 'mercados/categorias/produtos',
        canActivate: [AdminGuard],
        data: { roles: ['Admin', 'User'] },
        loadComponent: () => import('./pages/markets/categories/products/products.component').then(mod => mod.ProductsComponent)
    },
    {
        path: 'mercados/categorias/produtos/produto',
        canActivate: [AdminGuard],
        data: { roles: ['Admin', 'User'] },
        loadComponent: () => import('./pages/markets/categories/products/product/product.component').then(mod => mod.ProductComponent)
    },
    {
        path: 'perfis',
        loadComponent: () => import('./pages/profiles/profiles.component').then(mod => mod.ProfilesComponent)
    },
    {
        path: 'acabamentos',
        loadComponent: () => import('./pages/finishes/finishes.component').then(mod => mod.FinishesComponent),
        children: [
            {
                path: '',
                outlet: 'second',
                loadComponent: () => import('./components/finishes/main/main.component').then(mod => mod.MainComponent)
            },
            {
                title: 'Acabamentos - Olgacolor',
                path: 'products',
                outlet: 'second',
                loadComponent: () => import('./components/finishes/products/products.component').then(mod => mod.FinishesProductsComponent)
            },
        ]
    },
    {
        path: 'informativo',
        loadComponent: () => import('./pages/informative/informative.component').then(mod => mod.InformativeComponent)
    },
    {
        path: 'contato',
        loadComponent: () => import('./pages/contact/contact.component').then(mod => mod.ContactComponent)
    },
    {
        path: 'catalogos',
        loadComponent: () => import('./pages/catalogs/catalogs.component').then(mod => mod.CatalogsComponent)
    },
    {
        path: 'lme',
        loadComponent: () => import('./pages/lme/lme.component').then(mod => mod.LmeComponent)
    },
    {
        path: 'produtos',
        loadComponent: () => import('./pages/products/products.component').then(mod => mod.ProductsComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(mod => mod.LoginComponent)
    }
];
