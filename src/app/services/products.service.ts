import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { Profile } from '../interfaces/profile.interface';

@Injectable({ providedIn: 'root' })
export class ProductsService {

  public productSelected = signal<Profile | null>(null);
  public categorySelected = signal<string | null>(null);

  private readonly _http = inject(HttpClient);
  private readonly _url = `${environment.apiUrl}/api`;

  getProducts(): Observable<Profile[]> {
    return this._http.get<Profile[]>(`${this._url}/products`);
  }

}
