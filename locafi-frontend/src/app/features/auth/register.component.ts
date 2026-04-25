import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="relative min-h-screen overflow-hidden bg-transparent text-slate-100">
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(255,0,0,0.07),transparent_55%)]"
      ></div>
      <div class="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
        <a routerLink="/" class="mb-6 text-xs font-medium text-slate-500 transition hover:text-slate-300"
          >← Back</a
        >
        <section
          class="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-7 shadow-neo ring-1 ring-sparkasse/10 backdrop-blur-md"
        >
          <div class="mb-4 h-0.5 w-10 rounded-full bg-sparkasse"></div>
          <p class="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">Create wallet</p>
          <h1 class="mt-1 text-2xl font-semibold tracking-tight text-white">Join LocaFi</h1>
          <p class="mt-1 text-xs text-slate-500">We hash your password and store your city wallet on MongoDB Atlas.</p>

          <form class="mt-6 space-y-3" (ngSubmit)="submit()">
            <input
              [(ngModel)]="name"
              name="name"
              required
              type="text"
              placeholder="Full name"
              autocomplete="name"
              class="w-full rounded-xl border border-slate-700/90 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sparkasse/80 focus:ring-2 focus:ring-sparkasse/25"
            />
            <input
              [(ngModel)]="email"
              name="email"
              required
              type="email"
              placeholder="Email"
              autocomplete="email"
              class="w-full rounded-xl border border-slate-700/90 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sparkasse/80 focus:ring-2 focus:ring-sparkasse/25"
            />
            <input
              [(ngModel)]="password"
              name="password"
              required
              type="password"
              placeholder="Password"
              autocomplete="new-password"
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
                Creating account…
              } @else {
                Sign up
              }
            </button>
          </form>

          <p class="mt-5 text-center text-xs text-slate-500">
            Already have an account?
            <a routerLink="/login" class="font-medium text-slate-300 underline decoration-sparkasse/50 underline-offset-2 hover:text-white"
              >Log in</a
            >
          </p>
        </section>
      </div>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  name = '';
  email = '';
  password = '';
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  async submit(): Promise<void> {
    this.error.set(null);
    this.submitting.set(true);
    try {
      await this.auth.register({
        name: this.name,
        email: this.email,
        password: this.password,
      });
      await this.router.navigateByUrl('/dashboard');
    } catch {
      this.error.set('Could not sign up. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}
