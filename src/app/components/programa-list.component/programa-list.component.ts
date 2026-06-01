import { Component, OnInit } from '@angular/core';
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
  styleUrl: './programa-list.component.css'
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

  constructor(private programaService: ProgramaService, private router: Router) {}

  ngOnInit(): void {
    this.cargarProgramas();
  }

  cargarProgramas(): void {
    this.cargando = true;
    this.error = undefined;
    this.programaService.getAllProgramas().subscribe({
      next: (data) => {
        this.programas = data;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los programas. Por favor, intentá nuevamente.';
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.programas];
    if (this.searchTerm.trim()) {
      const t = this.searchTerm.toLowerCase();
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(t) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(t))
      );
    }
    if (this.filtroEstado === 'activos') resultado = resultado.filter(p => p.activo);
    if (this.filtroEstado === 'inactivos') resultado = resultado.filter(p => !p.activo);
    this.programasFiltrados = resultado;
  }

  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.aplicarFiltros();
  }

  cambiarFiltro(estado: 'todos' | 'activos' | 'inactivos'): void {
    this.filtroEstado = estado;
    this.aplicarFiltros();
  }

  contarActivos(): number { return this.programas.filter(p => p.activo).length; }
  contarInactivos(): number { return this.programas.filter(p => !p.activo).length; }

  irANuevo(): void { this.router.navigate(['/admin/programas/nuevo']); }
  editar(programa: Programa): void { this.router.navigate(['/admin/programas/editar', programa.idPrograma]); }

  confirmarCambioEstado(programa: Programa): void { this.programaParaCambiar = programa; }

  cancelarCambioEstado(): void {
    this.programaParaCambiar = null;
    this.procesandoCambio = false;
  }

  ejecutarCambioEstado(): void {
    if (!this.programaParaCambiar) return;
    const programa = this.programaParaCambiar;
    this.procesandoCambio = true;

    this.programaService.actualizarPrograma(programa.idPrograma, {
      nombre: programa.nombre,
      descripcion: programa.descripcion,
      tipoFormacion: programa.tipoFormacion,
      imagenUrl: programa.imagenUrl,
      activo: !programa.activo
    }).subscribe({
      next: () => {
        this.cargarProgramas();
        this.cancelarCambioEstado();
      },
      error: () => {
        alert('Error al cambiar el estado del programa');
        this.cancelarCambioEstado();
      }
    });
  }
}