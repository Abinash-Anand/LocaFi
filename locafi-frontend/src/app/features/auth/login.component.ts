import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="relative min-h-screen overflow-hidden bg-transparent text-slate-100">
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,0,0,0.08),transparent_50%)]"
      ></div>
      <div class="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
        <a routerLink="/" class="mb-6 text-xs font-medium text-slate-500 transition hover:text-slate-300"
          >← Back</a
        >
        <section
          class="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-7 shadow-neo ring-1 ring-sparkasse/10 backdrop-blur-md"
        >
          <div class="mb-4 h-0.5 w-10 rounded-full bg-sparkasse"></div>
          <p class="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">Sparkasse secure</p>
          <h1 class="mt-1 text-2xl font-semibold tracking-tight text-white">Log in to LocaFi</h1>
          <p class="mt-1 text-xs text-slate-500">Your session uses an encrypted JWT.</p>

          <form class="mt-6 space-y-3" (ngSubmit)="submit()">
            <input
              [(ngModel)]="email"
              name="email"
              required
              type="email"
              placeholder="Email"
              autocomplete="email"
              class="w-full rounded-xl border border-slate-700/90 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none ring-sparkasse/0 transition focus:border-sparkasse/80 focus:ring-2 focus:ring-sparkasse/25"
            />
            <input
              [(ngModel)]="password"
              name="password"
              required
              type="password"
              placeholder="Password"
              autocomplete="current-password"
              class="w-full rounded-xl border border-slate-700/90 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sparkasse/80 focus:ring-2 focus:ring-sparkasse/25"
            />

            @if (error()) {
              <p class="text-xs text-rose-300">{{ error() }}</p>
            }

            <button
              type="submit"
              [disabled]="submitting()"
              class="mt-1 w-full rounded-xl bg-sparkasse px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_-8px_rgba(255,0,0,0.4)] transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              @if (submitting()) {
                Signing in…
              } @else {
                Log in
              }
            </button>
          </form>

          <p class="mt-5 text-center text-xs text-slate-500">
            New here?
            <a routerLink="/signup" class="font-medium text-slate-300 underline decoration-sparkasse/50 underline-offset-2 hover:text-white"
              >Create an account</a
            >
          </p>
        </section>
      </div>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  async submit(): Promise<void> {
    this.error.set(null);
    this.submitting.set(true);
    try {
      await this.auth.login({
        email: this.email,
        password: this.password,
      });
      await this.router.navigateByUrl('/dashboard');
    } catch {
      this.error.set('Invalid email or password.');
    } finally {
      this.submitting.set(false);
    }
  }
}
