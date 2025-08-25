import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductsService {

  private readonly _http = inject(HttpClient);
  private readonly _url = `${environment.apiUrl}/api`;

  getProducts(): Observable<any[]> {
    return this._http.get<any[]>(`${this._url}/products`);
  }

}
