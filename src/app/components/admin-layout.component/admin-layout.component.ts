import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {

  constructor(private authService: AuthService) {}

  get usuario() {
    return this.authService.getCurrentUser();
  }

  get inicialUsuario(): string {
    return this.usuario?.nombre?.charAt(0)?.toUpperCase() ?? 'A';
  }

  logout(): void {
    this.authService.logout();
  }
}