# Olgacolor

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Video Optimization

O vídeo da página inicial foi otimizado para melhorar a performance de carregamento:

### Otimizações Implementadas:

1. **Lazy Loading**: O vídeo só é carregado quando fica visível na tela
2. **Preload Metadata**: Carrega apenas os metadados do vídeo inicialmente
3. **Loading State**: Indicador visual de carregamento com spinner animado
4. **Transition Effect**: Fade-in suave após o carregamento completo
5. **Intersection Observer**: Detecção automática de visibilidade do elemento
6. **Memory Management**: Limpeza automática do observer para evitar vazamentos

### Benefícios:

- **Redução significativa** no tempo de carregamento inicial
- **Economia de banda** - só carrega quando necessário
- **Melhor experiência do usuário** com feedback visual
- **Performance otimizada** para dispositivos móveis

## Finishes Page Optimization

A página de acabamentos foi otimizada para melhorar a experiência do usuário:

### Melhorias Implementadas:

1. **Marcação Visual de Seleção**
   - Item selecionado destacado com borda azul e background
   - Ícone de checkmark no canto superior direito
   - Animação suave de fade-in para o indicador
   - Efeito hover diferenciado para items selecionados

2. **Navegação Lateral Inteligente**
   - Drawer lateral abre na posição atual do scroll
   - Removido scroll automático para o topo
   - Posição do usuário na página é mantida
   - Limpeza automática da seleção ao fechar

3. **Estados Visuais Aprimorados**
   - Transições suaves entre estados
   - Hover effects diferenciados
   - Feedback visual claro da seleção
   - Design responsivo para mobile

### Benefícios UX:

- **Contexto Preservado** - usuário mantém sua posição na página
- **Feedback Visual Claro** - fácil identificação do item selecionado
- **Navegação Intuitiva** - drawer lateral não interrompe o fluxo
- **Performance** - animações otimizadas e responsivas

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
