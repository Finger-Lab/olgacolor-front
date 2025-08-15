import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, firstValueFrom, map, Observable } from 'rxjs';
import { RateDataInterface } from '../interfaces/rate-data.interface';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AluminumService {
  private readonly _http = inject(HttpClient);
  private readonly _url = `${environment.apiUrl}/api`;

  constructor() { }

  getRates(): Promise<any> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    const request =  this._http.get<any>(`${this._url}/currency-rates/current`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return firstValueFrom(request);
  }

  getMonthlyRates(typeAndDate: string = 'ALUMINUM'){
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    const request =  this._http.get<any>(`${this._url}/currency-rates/monthly?type=${typeAndDate}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return firstValueFrom(request);
  }

  getVariations(option: string = 'ALUMINUM', date?: string){
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    let url = `${this._url}/currency-rates/variations?type=${option}`;
    if (date) {
      url += `&date=${date}`;
    }

    const request = this._http.get<any[]>(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return firstValueFrom(request);
  }
}