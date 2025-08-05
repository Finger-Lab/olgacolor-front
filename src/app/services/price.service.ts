import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ApiResponse {
  results: {
    currencies: { [key: string]: Currency };
  }
}

export interface Currency {
  sigla: string,
  buy: number;
  name: string;
  code: string;
  variation: number;
}

@Injectable({
  providedIn: 'root'
})
export class PriceService {

  // private apiUrl = 'https://api.hgbrasil.com/finance?format=json-cors&key=b99232a3';
  private apiUrl: string = 'https://api.hgbrasil.com/finance?format=json-cors';
  private _http = inject(HttpClient);

  getCurrencies(): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(this.apiUrl)
  }

}
