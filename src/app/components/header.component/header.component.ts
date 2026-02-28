import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  constructor(
    private router: Router
  ){}
  mostrarModalContacto = false;
  mailCopiado = false;
  navegarAHome() {
    this.router.navigate(['/home']);
  }
navegarAEstado() {
    this.router.navigate(['/home/estado']);
  }
  redireccionar( redireccion : string): void{
    this.router.navigate([redireccion]);
  }

  abrirMail(event: Event): void {
  event.preventDefault();

  const email = 'talento.tech@bue.edu.ar';

  window.location.href = "https://mail.google.com/mail/?view=cm&fs=1&to=info@refuerzat.ar&su";
}
  abrirContacto(): void {
    this.mostrarModalContacto = true;
  }

  cerrarContacto(): void {
    this.mostrarModalContacto = false;
  }
copiarMail(): void {
  const email = 'info@refuerzat.ar';

  navigator.clipboard.writeText(email).then(() => {
    this.mailCopiado = true;

    setTimeout(() => {
      this.mailCopiado = false;
    }, 2000);
  });
}

}
