import { Routes } from '@angular/router';
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
    path: 'admin',
    loadComponent: () =>
      import('./components/admin-layout.component/admin-layout.component')
        .then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'programas', pathMatch: 'full' },
      {
        path: 'programas',
        loadComponent: () =>
          import('./components/programa-list.component/programa-list.component')
            .then(m => m.ProgramaListComponent)
      },
      {
        path: 'programas/nuevo',
        loadComponent: () =>
          import('./components/programa-form.component/programa-form.component')
            .then(m => m.ProgramaFormComponent)
      },
      {
        path: 'programas/editar/:id',
        loadComponent: () =>
          import('./components/programa-form.component/programa-form.component')
            .then(m => m.ProgramaFormComponent)
      },
      {
        path: 'comisiones',
        loadComponent: () =>
          import('./components/comision-list.component/comision-list.component')
            .then(m => m.ComisionListComponent)
      },
      {
        path: 'comisiones/nueva',
        loadComponent: () =>
          import('./components/comision-form.component/comision-form.component')
            .then(m => m.ComisionFormComponent)
      },
      {
        path: 'comisiones/editar/:id',
        loadComponent: () =>
          import('./components/comision-form.component/comision-form.component')
            .then(m => m.ComisionFormComponent)
      },
      {
        path: 'inscriptos',
        loadComponent: () =>
          import('./components/inscriptos-list.component/inscriptos-list.component')
            .then(m => m.InscriptosListComponent)
      },
      {
        path: 'inscriptos/editar/:id',
        loadComponent: () =>
          import('./components/inscriptos-form.component/inscriptos-form.component')
            .then(m => m.InscriptosFormComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];