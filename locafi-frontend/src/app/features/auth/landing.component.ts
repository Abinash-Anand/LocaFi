import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="min-h-screen bg-transparent text-slate-100">
      <div class="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-8 px-6 py-10">
        <section class="space-y-4">
          <p class="text-xs uppercase tracking-[0.22em] text-slate-400">LocaFi</p>
          <h1 class="text-4xl font-semibold leading-tight tracking-tight text-white">
            LocaFi: Your City, Your Wallet.
          </h1>
          <p class="text-sm leading-relaxed text-slate-300">
            Discover real-time, AI-powered local offers tailored to your exact location, and claim
            them instantly with your smart city wallet.
          </p>
        </section>

        <section class="space-y-3">
          <a
            routerLink="/signup"
            class="block w-full rounded-xl bg-sparkasse px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Get Started
          </a>
          <a
            routerLink="/login"
            class="block w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-center text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
          >
            Login
          </a>
        </section>
      </div>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {}
