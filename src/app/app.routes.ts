import { Routes } from '@angular/router';
import { InscriptosListComponent } from './components/inscriptos-list.component/inscriptos-list.component';
import { InscriptosFormComponent } from './components/inscriptos-form.component/inscriptos-form.component';

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
    path: 'admin/programas',
    loadComponent: () =>
      import('./components/programa-list.component/programa-list.component')
        .then(m => m.ProgramaListComponent)
  },

  {
    path: 'admin/programas/nuevo',
    loadComponent: () =>
      import('./components/programa-form.component/programa-form.component')
        .then(m => m.ProgramaFormComponent)
  },

  {
    path: 'admin/programas/editar/:id',
    loadComponent: () =>
      import('./components/programa-form.component/programa-form.component')
        .then(m => m.ProgramaFormComponent)
  },
    {
    path: 'admin/programas/editar/:id',
    loadComponent: () =>
      import('./components/programa-form.component/programa-form.component')
        .then(m => m.ProgramaFormComponent)
  },  {
    path: 'admin/comision',
    loadComponent: () =>
      import('./components/comision-list.component/comision-list.component')
        .then(m => m.ComisionListComponent)
  },  {
    path: 'admin/comision/editar/:id',
    loadComponent: () =>
      import('./components/comision-form.component/comision-form.component')
        .then(m => m.ComisionFormComponent)
  },
  {
    path: 'admin/comision/nueva',
    loadComponent: () =>
      import('./components/comision-form.component/comision-form.component')
        .then(m => m.ComisionFormComponent)
  },
{
  path: 'admin/inscriptos',
  component: InscriptosListComponent
},
{
  path: 'admin/inscriptos/editar/:id',
  component: InscriptosFormComponent
},
  {
    path: '**',
    redirectTo: ''
  }
];
