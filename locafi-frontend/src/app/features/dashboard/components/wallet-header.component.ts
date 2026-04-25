import { ChangeDetectionStrategy, Component, Input, Signal } from '@angular/core';
import { WalletState } from '../../../models/interfaces';

@Component({
  selector: 'app-wallet-header',
  standalone: true,
  template: `
    <section
      class="relative overflow-hidden rounded-3xl border border-slate-700/70 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-5 shadow-neo"
    >
      <div class="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-sparkasse/20 blur-3xl"></div>
      <div class="mb-5 flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.22em] text-slate-400">City Wallet</p>
          <h1 class="text-lg font-semibold tracking-tight text-white">Sparkasse DSV</h1>
        </div>
        <div class="rounded-xl bg-sparkasse px-3 py-1 text-xs font-semibold text-white">Premium</div>
      </div>

      @if (walletSignal(); as wallet) {
        <div class="flex items-end justify-between">
          <div>
            <p class="text-sm text-slate-400">Balance</p>
            <p class="text-3xl font-semibold text-white">EUR {{ wallet.balance.toFixed(2) }}</p>
          </div>
          <div class="rounded-2xl border border-slate-700/90 bg-slate-900/70 px-3 py-2 text-right">
            <p class="text-xs uppercase tracking-wider text-slate-400">Reward points</p>
            <p class="text-sm font-semibold text-slate-100">{{ wallet.dsvRewardPoints }}</p>
          </div>
        </div>
        @if (wallet.balance === 0) {
          <p
            class="mt-4 rounded-xl border border-sparkasse/30 bg-sparkasse/10 px-3 py-2.5 text-center text-xs font-medium leading-snug text-slate-100"
            role="status"
          >
            Top up your wallet to start claiming deals!
          </p>
        }
      } @else {
        <div class="h-16 animate-pulse rounded-xl bg-slate-800"></div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletHeaderComponent {
  @Input({ required: true }) walletSignal!: Signal<WalletState | null>;
}
