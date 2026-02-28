import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProgramaService } from '../../services/programa.service';
import { Programa } from '../../models/programa.model';

@Component({
  standalone: true,
  selector: 'app-programa-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './programa-list.component.html',
  styleUrls: ['./programa-list.component.css']
})
export class ProgramaListComponent implements OnInit {
  programas: Programa[] = [];
  programasFiltrados: Programa[] = [];
  cargando = false;
  error?: string;
  searchTerm = '';
  filtroEstado: 'todos' | 'activos' | 'inactivos' = 'todos';
  programaParaCambiar: Programa | null = null;
  procesandoCambio = false;
mostrarModalConfirmacion = false;
  constructor(
    private programaService: ProgramaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarProgramas();
  }
  cargarProgramas(): void {
    this.cargando = true;
    this.error = undefined;

    this.programaService.getAllProgramas().subscribe({
      next: (data) => {
        this.programas = data;
        this.filtrarProgramas();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar programas:', err);
        this.error = 'No se pudieron cargar los programas. Por favor, intenta nuevamente.';
        this.cargando = false;
      }
    });
  }


  filtrarProgramas(): void {
    let resultado = [...this.programas];
    if (this.searchTerm.trim()) {
      const termino = this.searchTerm.toLowerCase();
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(termino) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(termino))
      );
    }
    if (this.filtroEstado === 'activos') {
      resultado = resultado.filter(p => p.activo);
    } else if (this.filtroEstado === 'inactivos') {
      resultado = resultado.filter(p => !p.activo);
    }

    this.programasFiltrados = resultado;
  }

  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.filtrarProgramas();
  }

  cambiarFiltro(estado: 'todos' | 'activos' | 'inactivos'): void {
    this.filtroEstado = estado;
    this.filtrarProgramas();
  }

  contarActivos(): number {
    return this.programas.filter(p => p.activo).length;
  }

  contarInactivos(): number {
    return this.programas.filter(p => !p.activo).length;
  }

  irANuevo(): void {
    this.router.navigate(['/admin/programas/nuevo']);
  }
  editar(programa: Programa): void {
    this.router.navigate(['/admin/programas/editar', programa.idPrograma]);
  }

  confirmarCambioEstado(programa: Programa): void {
    this.programaParaCambiar = programa;
  }

  cancelarCambioEstado(): void {
    this.programaParaCambiar = null;
    this.procesandoCambio = false;
  }

    ejecutarCambioEstado(): void {
    if (!this.programaParaCambiar) return;
    const programa = this.programaParaCambiar;
    const nuevoEstado = !programa.activo;

    this.programaService.actualizarPrograma(programa.idPrograma, {
      nombre: programa.nombre,
      descripcion: programa.descripcion,
      tipoFormacion: programa.tipoFormacion,
      imagenUrl: programa.imagenUrl,
      activo: nuevoEstado
    }).subscribe({
      next: () => {
        this.cargarDatos();
        this.cerrarModal();
      },
      error: (err) => {
        if (err.error === 'activo') {
          alert('No se puede desactivar un programa con comisiones activas');
        } else {
          alert('Error al cambiar el estado del programa');
        }
        this.cerrarModal();
      }
    });
  }

  private mostrarNotificacion(mensaje: string, tipo: 'success' | 'error'): void {
    if (tipo === 'error') {
      alert(' ' + mensaje);
    } else {
      console.log(' ' + mensaje);
    }
  }
 abrirModalCambioEstado(programa: Programa): void {
    this.programaParaCambiar = programa;
    this.mostrarModalConfirmacion = true;
  }

  cerrarModal(): void {
    this.mostrarModalConfirmacion = false;
    this.programaParaCambiar = null;
  }
  cambiarEstado(programa: Programa): void {
    this.confirmarCambioEstado(programa);
  }
    cargarDatos(): void {
      this.cargando= true;
      this.error = undefined;
      this.programaService.getAllProgramas().subscribe({
      next: (programas) => {
        this.programas = programas;
        this.cargando =false;
      },
      error: () => {
        this.error ='Error al cargar los programas';
        this.cargando =false;
      }
    });
  }
}
