import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main
      class="relative min-h-screen overflow-hidden bg-transparent text-slate-100"
      role="main"
    >
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,0,0,0.12),transparent)]"
      ></div>
      <div
        class="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-sparkasse/10 blur-3xl"
      ></div>
      <div
        class="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-slate-600/20 blur-3xl"
      ></div>

      <div class="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-10 px-6 py-12">
        <div class="h-1 w-12 rounded-full bg-sparkasse shadow-[0_0_24px_rgba(255,0,0,0.45)]"></div>

        <section class="space-y-5">
          <p class="text-xs font-medium uppercase tracking-[0.28em] text-slate-400">LocaFi × Sparkasse</p>
          <h1 class="text-4xl font-semibold leading-[1.1] tracking-tight text-white md:text-[2.65rem]">
            Your city.<br />
            <span class="text-slate-300">Your wallet.</span>
          </h1>
          <p class="max-w-sm text-sm leading-relaxed text-slate-400">
            Generative, location-aware offers from local merchants—claimed in one tap with your DSV
            city wallet.
          </p>
        </section>

        <ul class="space-y-3 text-sm text-slate-300">
          <li class="flex items-center gap-3">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/60 text-sparkasse">◆</span>
            <span>Live neighborhood context and weather</span>
          </li>
          <li class="flex items-center gap-3">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/60 text-sparkasse">◆</span>
            <span>DSV savings highlighted on every offer</span>
          </li>
          <li class="flex items-center gap-3">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/60 text-sparkasse">◆</span>
            <span>Secure login; your balance stays in sync</span>
          </li>
        </ul>

        <section class="flex flex-col gap-3 pt-2">
          <a
            routerLink="/signup"
            class="block w-full rounded-2xl bg-sparkasse px-4 py-3.5 text-center text-sm font-semibold text-white shadow-[0_16px_40px_-12px_rgba(255,0,0,0.45)] transition hover:bg-red-600"
          >
            Get started
          </a>
          <a
            routerLink="/login"
            class="block w-full rounded-2xl border border-slate-600/90 bg-slate-950/50 px-4 py-3.5 text-center text-sm font-semibold text-slate-100 backdrop-blur-sm transition hover:border-slate-500 hover:bg-slate-900/70"
          >
            Log in
          </a>
        </section>
      </div>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {}
