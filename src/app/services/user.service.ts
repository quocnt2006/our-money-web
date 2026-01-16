import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  register(payload: { name: string; email: string; password: string; familyId: number; role: string }) {
    return this.http.post(`${environment.apiUrl}/api/Auth/register`, payload, { withCredentials: true });
  }

  login(payload: { email: string; password: string }) {
    return this.http.post(`${environment.apiUrl}/api/Auth/login`, payload, { withCredentials: true });
  }

  refresh() {
    return this.http.post(`${environment.apiUrl}/api/Auth/refresh`, {}, { withCredentials: true });
  }
}
