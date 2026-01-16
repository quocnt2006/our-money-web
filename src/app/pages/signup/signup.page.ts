import { ChangeDetectionStrategy, Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Store } from '@ngrx/store';
import { signup } from '../../store/auth.actions';
import { selectAuthLoading } from '../../store/auth.selectors';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-signup-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupPage {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private sub = new Subscription();
  protected readonly loading = signal(false);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  submit() {
    if (this.form.invalid) return;
    const { name, email, password } = this.form.value as { name: string; email: string; password: string };
    this.store.dispatch(signup({ name, email, password }));
  }

  constructor() {
    this.sub.add(this.store.select(selectAuthLoading).subscribe((v) => this.loading.set(!!v)));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
