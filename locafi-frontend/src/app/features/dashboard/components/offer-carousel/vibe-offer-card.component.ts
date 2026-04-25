import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { VibeOffer } from '../../../../models/interfaces';

@Component({
  selector: 'app-vibe-offer-card',
  standalone: true,
  template: `
    <article
      class="w-[280px] shrink-0 snap-start rounded-3xl border border-slate-700/80 bg-gradient-to-b from-slate-900 to-slate-900/85 p-4 shadow-neo"
    >
      <div class="mb-3 flex items-center justify-between">
        <span class="rounded-full border border-slate-600 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200">
          {{ offer.tag }}
        </span>
        <span class="text-xs text-slate-400">{{ offer.expiryMinutes }} min left</span>
      </div>

      <h3 class="text-base font-semibold tracking-tight text-white">{{ offer.title }}</h3>
      <p class="mt-1 text-sm text-slate-300">
        @if (offer.distanceMeters > 0) {
          <span>{{ offer.merchantName }} - {{ offer.distanceMeters }}m away</span>
        } @else {
          <span>{{ offer.merchantName }} - nearby</span>
        }
      </p>

      @if (offer.pricingIsEstimated) {
        <p class="mt-2 text-xs font-medium text-amber-200/90">Estimated pricing (market average)</p>
      }

      <div class="mt-4 rounded-2xl border border-slate-700/80 bg-slate-800/80 p-3">
        <p class="text-xs uppercase tracking-wider text-slate-400">DSV Savings</p>
        <div class="mt-1 flex items-end justify-between">
          <p class="text-xl font-semibold text-sparkasse">EUR {{ offer.dsvDiscountPrice.toFixed(2) }}</p>
          <p class="text-xs text-slate-400 line-through">EUR {{ offer.originalPrice.toFixed(2) }}</p>
        </div>
      </div>

      <button
        type="button"
        class="mt-4 w-full rounded-xl bg-sparkasse px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-sparkasse/70"
        (click)="claim.emit(offer)"
      >
        Claim with City-Wallet
      </button>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VibeOfferCardComponent {
  @Input({ required: true }) offer!: VibeOffer;
  @Output() claim = new EventEmitter<VibeOffer>();
}
