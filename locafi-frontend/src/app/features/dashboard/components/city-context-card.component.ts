import { ChangeDetectionStrategy, Component, Input, Signal } from '@angular/core';
import { CityContext } from '../../../models/interfaces';

@Component({
  selector: 'app-city-context-card',
  standalone: true,
  template: `
    <section class="rounded-3xl border border-slate-700/70 bg-slate-900/75 p-5 shadow-neo backdrop-blur">
      <div class="mb-2 flex items-center justify-between">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Live City Context</p>
        @if (isLoadingSignal()) {
          <div class="flex items-center gap-1.5">
            <span class="h-2 w-2 animate-pulse rounded-full bg-sparkasse"></span>
            <span class="h-2 w-2 animate-pulse rounded-full bg-sparkasse [animation-delay:150ms]"></span>
            <span class="h-2 w-2 animate-pulse rounded-full bg-sparkasse [animation-delay:300ms]"></span>
          </div>
        }
      </div>

      @if (contextSignal(); as context) {
        <h2 class="text-xl font-semibold tracking-tight text-white">{{ context.locationName }} is buzzing</h2>
        <p class="mt-1 text-sm text-slate-300">{{ context.weather }}</p>
        <div class="mt-4 flex items-center justify-between rounded-2xl border border-slate-700/80 bg-slate-800/80 px-4 py-3">
          <span class="text-sm text-slate-300">Vibe score</span>
          <span class="text-lg font-semibold text-emerald-300">{{ context.vibeScore }}/100</span>
        </div>
      } @else {
        <div class="space-y-3">
          <div class="h-5 w-3/5 animate-pulse rounded bg-slate-800"></div>
          <div class="h-4 w-2/5 animate-pulse rounded bg-slate-800"></div>
          <div class="h-12 animate-pulse rounded-2xl bg-slate-800"></div>
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CityContextCardComponent {
  @Input({ required: true }) contextSignal!: Signal<CityContext | null>;
  @Input({ required: true }) isLoadingSignal!: Signal<boolean>;
}
