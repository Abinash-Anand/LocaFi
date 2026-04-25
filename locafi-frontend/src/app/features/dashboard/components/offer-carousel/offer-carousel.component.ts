import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, Signal } from '@angular/core';
import { VibeOffer } from '../../../../models/interfaces';
import { VibeOfferCardComponent } from './vibe-offer-card.component';

@Component({
  selector: 'app-offer-carousel',
  standalone: true,
  imports: [VibeOfferCardComponent],
  template: `
    @if (isLoadingSignal()) {
      <div
        class="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-busy="true"
      >
        @for (s of skeletonSlots; track s) {
          <div
            class="h-[200px] w-[280px] shrink-0 snap-start animate-pulse rounded-3xl border border-slate-700/60 bg-gradient-to-b from-slate-800 to-slate-900/80"
          ></div>
        }
      </div>
    } @else if (offersSignal().length > 0) {
      <div
        class="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        @for (offer of offersSignal(); track offer.id) {
          <app-vibe-offer-card [offer]="offer" (claim)="claimOffer.emit($event)" />
        }
      </div>
    } @else {
      <div class="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-center">
        <p class="text-sm text-slate-400">No live offers right now. Try refreshing your city context.</p>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferCarouselComponent {
  @Input({ required: true }) offersSignal!: Signal<VibeOffer[]>;
  @Input({ required: true }) isLoadingSignal!: Signal<boolean>;
  @Output() claimOffer = new EventEmitter<VibeOffer>();

  readonly skeletonSlots = [1, 2, 3] as const;
}
