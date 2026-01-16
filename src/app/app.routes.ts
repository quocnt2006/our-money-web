import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { SignupPage } from './pages/signup/signup.page';

export const routes: Routes = [
	{ path: '', component: LoginPage },
	{ path: 'signup', component: SignupPage },
	{ path: 'dashboard', component: DashboardPage },
	{ path: '**', redirectTo: '' }
];
