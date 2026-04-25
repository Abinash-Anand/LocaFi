import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LandingComponent } from './features/auth/landing.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { VibeDashboardComponent } from './features/dashboard/vibe-dashboard.component';

export const appRoutes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'signup', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: VibeDashboardComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
