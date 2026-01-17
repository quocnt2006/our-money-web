import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/auth.actions';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();

  constructor(private store: Store) {}

  logout() {
    this.store.dispatch(AuthActions.logoutRequested());
    this.close.emit();
  }
}
