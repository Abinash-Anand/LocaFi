import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CityContext, VibeOffer, WalletState } from '../models/interfaces';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { LocationEngineService } from './location-engine.service';

@Injectable({
  providedIn: 'root'
})
export class VibeStore {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly locationEngine = inject(LocationEngineService);

  private readonly _currentContext = signal<CityContext | null>(null);
  private readonly _activeOffers = signal<VibeOffer[]>([]);
  private readonly _walletState = signal<WalletState | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  /** True while waiting on `navigator.geolocation` (before API call). */
  private readonly _awaitingGps = signal<boolean>(false);

  readonly currentContext: Signal<CityContext | null> = this._currentContext.asReadonly();
  readonly activeOffers: Signal<VibeOffer[]> = this._activeOffers.asReadonly();
  readonly walletState: Signal<WalletState | null> = this._walletState.asReadonly();
  readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();
  readonly isAwaitingGps: Signal<boolean> = this._awaitingGps.asReadonly();

  readonly hasOffers = computed(() => this._activeOffers().length > 0);

  /**
   * Resolves GPS (or Stuttgart fallback), then loads city context and offers from the Nest API.
   * Intended for `provideAppInitializer` so the app starts with live data.
   */
  bootstrapFromApi(): Promise<void> {
    const user = this.auth.getCurrentUser();
    const fallbackUserId = user?.id ?? user?.name ?? 'unknown-user';

    this._awaitingGps.set(true);
    this.setLoading(true);

    return this.locationEngine
      .getPositionOrStuttgartFallback()
      .then(async (coords) => {
        this._awaitingGps.set(false);
        const [contextRes, walletRes] = await Promise.all([
          firstValueFrom(this.api.getContext(coords.lat, coords.lng)),
          firstValueFrom(this.api.getWallet()),
        ]);
        this.setVibeData(contextRes.context, contextRes.offers, walletRes);
      })
      .catch(() => {
        this._activeOffers.set([]);
        this._currentContext.set({
          locationName: 'Stuttgart',
          weather: 'Could not reach the LocaFi API. Is the backend running on port 3000?',
          vibeScore: 0
        });
        if (!this._walletState()) {
          this._walletState.set({
            userId: fallbackUserId,
            balance: 0,
            dsvRewardPoints: 0,
          });
        }
      })
      .finally(() => {
        this._awaitingGps.set(false);
        this.setLoading(false);
      });
  }

  async claimOffer(offer: VibeOffer): Promise<void> {
    const wallet = this._walletState();
    if (!wallet) {
      return;
    }

    const updatedWallet = await firstValueFrom(
      this.api.claimWallet({
        title: offer.title,
        merchantName: offer.merchantName,
        amount: offer.dsvDiscountPrice,
        points: Math.round(offer.dsvDiscountPrice),
      }),
    );
    this._walletState.set(updatedWallet);
  }

  setContext(context: CityContext): void {
    this._currentContext.set(context);
  }

  setOffers(offers: VibeOffer[]): void {
    this._activeOffers.set(offers);
  }

  setWalletState(wallet: WalletState): void {
    this._walletState.set(wallet);
  }

  updateWalletState(patch: Partial<WalletState>): void {
    this._walletState.update((current) => {
      if (!current) {
        return null;
      }

      return {
        ...current,
        ...patch
      };
    });
  }

  setLoading(isLoading: boolean): void {
    this._isLoading.set(isLoading);
  }

  setVibeData(context: CityContext, offers: VibeOffer[], wallet?: WalletState): void {
    this._currentContext.set(context);
    this._activeOffers.set(offers);
    if (wallet) {
      this._walletState.set(wallet);
    }
  }

  clear(): void {
    this._currentContext.set(null);
    this._activeOffers.set([]);
    this._walletState.set(null);
    this._isLoading.set(false);
    this._awaitingGps.set(false);
  }
}
