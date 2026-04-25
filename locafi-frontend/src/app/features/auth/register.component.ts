import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="min-h-screen bg-transparent text-slate-100">
      <div class="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
        <section class="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-6 shadow-neo">
          <p class="text-xs uppercase tracking-[0.22em] text-slate-400">Create account</p>
          <h1 class="mt-1 text-2xl font-semibold tracking-tight text-white">Join LocaFi</h1>

          <form class="mt-5 space-y-3" (ngSubmit)="submit()">
            <input
              [(ngModel)]="name"
              name="name"
              required
              type="text"
              placeholder="Name"
              class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-sparkasse"
            />
            <input
              [(ngModel)]="email"
              name="email"
              required
              type="email"
              placeholder="Email"
              class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-sparkasse"
            />
            <input
              [(ngModel)]="password"
              name="password"
              required
              type="password"
              placeholder="Password"
              class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-sparkasse"
            />

            @if (error()) {
              <p class="text-xs text-rose-300">{{ error() }}</p>
            }

            <button
              type="submit"
              [disabled]="submitting()"
              class="w-full rounded-xl bg-sparkasse px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              @if (submitting()) { Creating account... } @else { Sign up }
            </button>
          </form>

          <p class="mt-4 text-xs text-slate-400">
            Already have an account?
            <a routerLink="/login" class="text-slate-200 underline">Login</a>
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
