import { ChangeDetectionStrategy, Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { login } from '../../store/auth.actions';
import { selectAuthLoading } from '../../store/auth.selectors';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private sub = new Subscription();
  protected readonly loading = signal(false);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  protected goToSignup() {
    this.router.navigate(['/signup']);
  }

  submit() {
    if (this.form.invalid) return;
    const { email, password } = this.form.value as { email: string; password: string };
    this.store.dispatch(login({ email, password }));
  }

  constructor() {
    this.sub.add(this.store.select(selectAuthLoading).subscribe((v) => this.loading.set(!!v)));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
