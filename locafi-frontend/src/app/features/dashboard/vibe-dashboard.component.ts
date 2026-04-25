import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { VibeOffer } from '../../models/interfaces';
import { VibeStore } from '../../services/vibe-store.service';
import { CityContextCardComponent } from './components/city-context-card.component';
import { OfferCarouselComponent } from './components/offer-carousel/offer-carousel.component';
import { WalletHeaderComponent } from './components/wallet-header.component';

@Component({
  selector: 'app-vibe-dashboard',
  standalone: true,
  imports: [WalletHeaderComponent, CityContextCardComponent, OfferCarouselComponent],
  template: `
    <main class="min-h-screen bg-transparent text-slate-100">
      <div class="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pb-10 pt-6">
        <header class="mb-1">
          <p class="text-xs uppercase tracking-[0.22em] text-slate-400">LocaFi</p>
          <h1 class="text-2xl font-semibold tracking-tight text-white">Your city wallet</h1>
        </header>

        @if (store.isLoading()) {
          <div
            class="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/70 px-3 py-2.5 text-sm text-slate-300"
          >
            <span class="h-2 w-2 animate-pulse rounded-full bg-sparkasse"></span>
            <span class="h-2 w-2 animate-pulse rounded-full bg-sparkasse [animation-delay:150ms]"></span>
            <span class="h-2 w-2 animate-pulse rounded-full bg-sparkasse [animation-delay:300ms]"></span>
            @if (store.isAwaitingGps()) {
              <span>Sensing your local vibe...</span>
            } @else {
              <span>Syncing city context and offers</span>
            }
          </div>
        }

        <app-wallet-header [walletSignal]="store.walletState" />

        <app-city-context-card
          [contextSignal]="store.currentContext"
          [isLoadingSignal]="store.isLoading"
        />

        <section class="space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-semibold tracking-tight text-slate-50">Local vibe offers</h2>
            <span
              class="rounded-full border border-slate-700/90 bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-300 shadow-neo"
            >
              @if (store.isLoading()) {
                ...
              } @else {
                {{ store.activeOffers().length }} live
              }
            </span>
          </div>

          <app-offer-carousel
            [offersSignal]="store.activeOffers"
            [isLoadingSignal]="store.isLoading"
            (claimOffer)="claimOffer($event)"
          />
        </section>
      </div>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VibeDashboardComponent implements OnInit {
  readonly store = inject(VibeStore);

  ngOnInit(): void {
    if (!this.store.currentContext() && !this.store.isLoading()) {
      void this.store.bootstrapFromApi();
    }
  }

  async claimOffer(offer: VibeOffer): Promise<void> {
    await this.store.claimOffer(offer);
  }
}
