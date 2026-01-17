import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { SignupPage } from './pages/signup/signup.page';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
	{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
	{ path: 'login', component: LoginPage },
	{ path: 'signup', component: SignupPage },
	{ path: 'dashboard', component: DashboardPage, canActivate: [AuthGuard] },
	{ path: '**', redirectTo: '' }
];
