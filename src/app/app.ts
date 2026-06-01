import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header.component/header.component';
import { FooterComponent } from './components/footer.component/footer.component';
import { filter } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  private router = inject(Router);

  mostrarShellPublico = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: any) => {
        const url: string = e.urlAfterRedirects;
        return !url.startsWith('/admin') && !url.startsWith('/login');
      })
    ),
    { initialValue: true }
  );
}