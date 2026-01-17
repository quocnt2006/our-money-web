import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
    name: ['', [Validators.required.bind(Validators)]],
    email: ['', [Validators.required.bind(Validators), Validators.email.bind(Validators)]],
    password: ['', [Validators.required.bind(Validators)]],
    confirmPassword: ['', [Validators.required.bind(Validators)]]
  });

  constructor() {
    this.sub.add(this.store.select(selectAuthLoading).subscribe((v) => this.loading.set(!!v)));
    this.form.setValidators(this.passwordsMatchValidator);
  }

  submit() {
    if (this.form.invalid) return;
    const { name, email, password } = this.form.value as { name: string; email: string; password: string };
    this.store.dispatch(signup({ name, email, password }));
  }


  private passwordsMatchValidator(this: void, control: AbstractControl): ValidationErrors | null {
    const pwdCtrl = control.get('password');
    const confirmCtrl = control.get('confirmPassword');

    const pwd = typeof pwdCtrl?.value === 'string' ? pwdCtrl.value : null;
    const confirm = typeof confirmCtrl?.value === 'string' ? confirmCtrl.value : null;

    if (pwd !== null && confirm !== null && pwd !== confirm) return { passwordsMismatch: true };
    return null;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
