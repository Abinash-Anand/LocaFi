import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CityContext, VibeOffer, WalletState } from '../models/interfaces';

export interface ContextApiResponse {
  context: CityContext;
  offers: VibeOffer[];
  wallet: WalletState;
}

export interface ClaimWalletRequest {
  title: string;
  merchantName: string;
  amount: number;
  points: number;
}

const API_BASE_URL = 'http://localhost:3000';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);

  getContext(lat: number, lng: number): Observable<ContextApiResponse> {
    console.log('[ApiService] GET /api/context', { lat, lng });
    const params = new HttpParams().set('lat', String(lat)).set('lng', String(lng));
    return this.http.get<ContextApiResponse>(`${API_BASE_URL}/api/context`, { params });
  }

  getWallet(): Observable<WalletState> {
    return this.http.get<WalletState>(`${API_BASE_URL}/api/wallet`);
  }

  claimWallet(payload: ClaimWalletRequest): Observable<WalletState> {
    return this.http.post<WalletState>(`${API_BASE_URL}/api/wallet/claim`, payload);
  }
}
