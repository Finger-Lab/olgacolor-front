import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl, SafeScript, SafeStyle, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safe',
  standalone: true
})
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(url: string, type: string = 'resourceUrl'): SafeUrl | SafeResourceUrl | SafeHtml | SafeStyle | SafeScript {
    switch (type) {
      case 'html':
        return this.sanitizer.bypassSecurityTrustHtml(url);
      case 'style':
        return this.sanitizer.bypassSecurityTrustStyle(url);
      case 'script':
        return this.sanitizer.bypassSecurityTrustScript(url);
      case 'url':
        return this.sanitizer.bypassSecurityTrustUrl(url);
      case 'resourceUrl':
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
      default:
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }
}
