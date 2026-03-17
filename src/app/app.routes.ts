import { Routes } from '@angular/router';
import { InscriptosListComponent } from './components/inscriptos-list.component/inscriptos-list.component';
import { InscriptosFormComponent } from './components/inscriptos-form.component/inscriptos-form.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [

  {
    path: '',
    loadComponent: () =>
      import('./components/inscripcion.component/inscripcion.component')
        .then(m => m.InscripcionComponent)
  },

  {
    path: 'exito',
    loadComponent: () =>
      import('./components/form-exito.component/form-exito.component')
        .then(m => m.FormExitoComponent)
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./components/login.component/login.component')
        .then(m => m.LoginComponent)
  },

  {
    path: 'admin/programas',
    loadComponent: () =>
      import('./components/programa-list.component/programa-list.component')
        .then(m => m.ProgramaListComponent),
    canActivate: [authGuard]
  },

  {
    path: 'admin/programas/nuevo',
    loadComponent: () =>
      import('./components/programa-form.component/programa-form.component')
        .then(m => m.ProgramaFormComponent),
    canActivate: [authGuard]
  },

  {
    path: 'admin/programas/editar/:id',
    loadComponent: () =>
      import('./components/programa-form.component/programa-form.component')
        .then(m => m.ProgramaFormComponent),
    canActivate: [authGuard]
  },

  {
    path: 'admin/comisiones',
    loadComponent: () =>
      import('./components/comision-list.component/comision-list.component')
        .then(m => m.ComisionListComponent),
    canActivate: [authGuard]
  },

  {
    path: 'admin/comisiones/nueva',
    loadComponent: () =>
      import('./components/comision-form.component/comision-form.component')
        .then(m => m.ComisionFormComponent),
    canActivate: [authGuard]
  },

  {
    path: 'admin/comisiones/editar/:id',
    loadComponent: () =>
      import('./components/comision-form.component/comision-form.component')
        .then(m => m.ComisionFormComponent),
    canActivate: [authGuard]
  },

  {
    path: 'admin/inscriptos',
    component: InscriptosListComponent,
    canActivate: [authGuard]
  },

  {
    path: 'admin/inscriptos/editar/:id',
    component: InscriptosFormComponent,
    canActivate: [authGuard]
  },

  {
    path: '**',
    redirectTo: ''
  }
];