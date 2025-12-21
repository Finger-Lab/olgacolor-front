import { Routes } from '@angular/router';
import { AdminGuard } from './auth/admin.guard';
import { ObrasComponent } from './pages/obras/obras.component';

export const routes: Routes = [
    {
        path: 'dashboard',
        canActivate: [AdminGuard],
        data: { roles: ['Admin', 'User'] },
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(mod => mod.DashboardComponent)
    },
    {
        path: 'area-restrita',
        redirectTo: 'catalogos'
    },
    {
        path: 'admin',
        canActivate: [AdminGuard],
        data: { roles: ['Admin'] },
        loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard.component').then(mod => mod.AdminDashboardComponent)
    },
    {
        path: 'admin/usuarios',
        canActivate: [AdminGuard],
        data: { roles: ['Admin'] },
        loadComponent: () => import('./pages/admin/manage-users/manage-users.component').then(mod => mod.ManageUsersComponent)
    },
    {
        path: 'admin/obras',
        canActivate: [AdminGuard],
        loadComponent: () => import('./pages/admin/obras/obras-admin.component').then(mod => mod.ObrasAdminComponent)
    },
    {
        path: 'admin/perfis',
        canActivate: [AdminGuard],
        loadComponent: () => import('./pages/admin/profiles/profiles-admin.component').then(m => m.ProfilesAdminComponent)
    },
    {
        path: 'admin/perfis/imagens',
        canActivate: [AdminGuard],
        loadComponent: () => import('./pages/admin/profiles/profile-images.component')
          .then(mod => mod.ProfileImagesComponent)
    },
    {
        path: 'admin/tipos-sistemas',
        canActivate: [AdminGuard],
        data: { roles: ['Admin'] },
        loadComponent: () => import('./pages/admin/system-types/system-types-admin.component').then(mod => mod.SystemTypesAdminComponent)
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'pagina-inicial'
    },
    {
        path: 'dashboard-logado',
        redirectTo: 'dashboard'
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
        path: 'politica-de-privacidade',
        loadComponent: () => import('./pages/privacy-policy/privacy-policy.component').then(c => c.PrivacyPolicyComponent)
    },
    {
        path: 'politica-de-cookies',
        loadComponent: () => import('./pages/cookies-policy/cookies-policy.component').then(c => c.CookiesPolicyComponent)
    },
    {
        path: 'video-institucional',
        loadComponent: () => import('./pages/institutional-video/institutional-video.component').then(c => c.InstitutionalVideoComponent)
    },
    {
        path: 'juridico',
        loadComponent: () => import('./pages/juridico/juridico.component').then(c => c.JuridicoComponent),
        children: [
            {
                path: '',
                redirectTo: 'lgpd',
                pathMatch: 'full'
            },
            {
                path: 'lgpd',
                loadComponent: () => import('./pages/juridico/lgpd/lgpd.component').then(c => c.LgpdComponent)
            },
            {
                path: 'ouvidoria',
                loadComponent: () => import('./pages/juridico/ouvidoria/ouvidoria.component').then(c => c.OuvidoriaComponent)
            },
            {
                path: 'compliance',
                loadComponent: () => import('./pages/juridico/compliance/compliance.component').then(c => c.ComplianceComponent)
            },
            {
                path: 'cookies',
                loadComponent: () => import('./pages/juridico/cookies-juridico/cookies-juridico.component').then(c => c.CookiesJuridicoComponent)
            }
        ]
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
        path: 'processos-producao/efeito-madeira',
        loadComponent: () => import('./pages/processes-production/wood-effect/wood-effect.component').then(mod => mod.WoodEffectComponent)
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
    {
        path: 'mercados/olglas-ensaio',
        loadComponent: () => import('./pages/markets/olglas-ensaio/olglas-ensaio.component').then(mod => mod.OlglasEnsaioComponent)
    },
    {
        path: 'mercados/moveleira-ensaio',
        loadComponent: () => import('./pages/markets/moveleira-ensaio/moveleira-ensaio.component').then(mod => mod.MoveleiraEnsaioComponent)
    },
    {
        path: 'mercados/industrial-ensaio',
        loadComponent: () => import('./pages/markets/industrial-ensaio/industrial-ensaio.component').then(mod => mod.IndustrialEnsaioComponent)
    },
    {
        path: 'mercados/janela-ensaio',
        loadComponent: () => import('./pages/markets/janela-ensaio/janela-ensaio.component').then(mod => mod.JanelaEnsaioComponent)
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
        loadComponent: () => import('./pages/profiles/profiles.component').then(mod => mod.ProfilesComponent),
        children: [
            {
                path: '',
                loadComponent: () => import('./components/profiles/main/main.component').then(mod => mod.MainComponent)
            },
            {
                path: 'produtos',
                title: 'Perfis - Olgacolor',
                loadComponent: () => import('./pages/products/products.component').then(c => c.ProductsComponent)
            },
        ]
    },
    {
        path: 'acabamentos',
        loadComponent: () => import('./pages/finishes/finishes.component').then(mod => mod.FinishesComponent),
        children: [
            {
                path: '',
                loadComponent: () => import('./components/finishes/main/main.component').then(mod => mod.MainComponent)
            },
            {
                path: 'produtos',
                title: 'Acabamentos - Olgacolor',
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
        path: 'trabalhe-conosco',
        loadComponent: () => import('./pages/trabalhe-conosco/trabalhe-conosco.component').then(mod => mod.TrabalheConoscoComponent)
    },
    {
        path: 'catalogos',
        canActivate: [AdminGuard],
        data: { roles: ['Admin', 'User'] },
        loadComponent: () => import('./pages/catalogs/catalogs.component').then(mod => mod.CatalogsComponent),
        children: [
            {
                path: '',
                loadComponent: () => import('./pages/catalogs/products/catalog-products.component').then(mod => mod.CatalogProductsComponent)
            },
            {
                path: 'produtos',
                title: 'Catálogos - Olgacolor',
                loadComponent: () => import('./pages/catalogs/products/catalog-products.component').then(mod => mod.CatalogProductsComponent)
            },
            {
                path: 'material-tecnico/:id',
                title: 'Material Técnico - Olgacolor',
                loadComponent: () => import('./pages/catalogs/material-tecnico/material-tecnico.component').then(mod => mod.MaterialTecnicoComponent)
            },
        ]
    },
    {
        path: 'lme',
        loadComponent: () => import('./pages/lme/lme.component').then(mod => mod.LmeComponent)
    },
    // {
    //     path: 'produtos',
    //     loadComponent: () => import('./pages/products/products.component').then(mod => mod.ProductsComponent)
    // },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(mod => mod.LoginComponent)
    },
    {
        path: 'cadastre-se',
        loadComponent: () => import('./auth/register/register.component').then(mod => mod.RegisterComponent)
    },
    {
        path: 'responsabilidade-ambiental',
        loadComponent: () => import('./pages/environmental-responsibility/environmental-responsibility.component').then(mod => mod.EnvironmentalResponsibilityComponent)
    },
    {
        path: 'obras', 
        loadComponent: () => import('./pages/obras/obras.component').then(mod => mod.ObrasComponent),
        children: [
            {
                path: 'cards', 
                loadComponent: () => import('./pages/obras/cards/cards.component').then(mod => mod.CardsComponent)
            }
        ]
    },
    {
        path: 'obra/:id',
        loadComponent: () => import('./pages/obras/obra-detail/obra-detail.component').then(mod => mod.ObraDetailComponent)
    }
];
