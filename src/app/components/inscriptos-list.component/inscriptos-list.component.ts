import { Component, OnInit, signal, computed, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { InscripcionService } from '../../services/inscripcion.service';
import { ProgramaService } from '../../services/programa.service';
import { ComisionService } from '../../services/comision.service';
import { Inscripto } from '../../models/inscripto.model';
import { Programa } from '../../models/programa.model';
import { Comision } from '../../models/comision.model';

@Component({
  selector: 'app-inscriptos-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inscriptos-list.component.html',
  styleUrl: './inscriptos-list.component.css'
})
export class InscriptosListComponent implements OnInit {

  inscriptos = signal<Inscripto[]>([]);
  programas = signal<Programa[]>([]);
  comisiones = signal<Comision[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  searchTerm = signal('');
  filtroProgramaId = signal<number | null>(null);
  filtroComisionId = signal<number | null>(null);

  inscriptoAEliminar: Inscripto | null = null;
  mostrarModalDescarga = false;

  inscriptosFiltrados = computed(() => {
    let resultado = this.inscriptos();

    if (this.filtroProgramaId()) {
      resultado = resultado.filter(i => i.programaId === this.filtroProgramaId());
    }
    if (this.filtroComisionId()) {
      resultado = resultado.filter(i => i.comisionId === this.filtroComisionId());
    }

    const t = this.searchTerm().toLowerCase().trim();
    if (t) {
      resultado = resultado.filter(i =>
        i.nombre.toLowerCase().includes(t) ||
        i.apellido.toLowerCase().includes(t) ||
        i.dni.includes(t) ||
        i.correoElectronico.toLowerCase().includes(t) ||
        i.programaNombre?.toLowerCase().includes(t) ||
        i.comisionCodigo?.toLowerCase().includes(t)
      );
    }
    return resultado;
  });

  comisionesFiltradas = computed(() => {
    const pid = this.filtroProgramaId();
    if (!pid) return this.comisiones();
    return this.comisiones().filter(c => c.programaId === pid);
  });

  contadores = computed(() => ({
    total: this.inscriptos().length,
    filtrados: this.inscriptosFiltrados().length
  }));

  constructor(
    private inscripcionService: InscripcionService,
    private programaService: ProgramaService,
    private comisionService: ComisionService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      inscriptos: this.inscripcionService.getAllInscriptos(),
      programas: this.programaService.getAllProgramas(),
      comisiones: this.comisionService.getAllComisiones()
    }).subscribe({
      next: ({ inscriptos, programas, comisiones }) => {
        this.inscriptos.set(inscriptos);
        this.programas.set(programas);
        this.comisiones.set(comisiones);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los datos');
        this.loading.set(false);
      }
    });
  }

  cambiarFiltroPrograma(programaId: string): void {
    this.filtroProgramaId.set(programaId ? Number(programaId) : null);
    this.filtroComisionId.set(null);
  }

  cambiarFiltroComision(comisionId: string): void {
    this.filtroComisionId.set(comisionId ? Number(comisionId) : null);
  }

  editarInscripto(id: number): void {
    this.router.navigate([`/admin/inscriptos/editar/${id}`]);
  }

  confirmarEliminar(inscripto: Inscripto): void { this.inscriptoAEliminar = inscripto; }
  cerrarModalEliminar(): void { this.inscriptoAEliminar = null; }

  ejecutarEliminar(): void {
    if (!this.inscriptoAEliminar) return;
    this.inscripcionService.eliminarInscripto(this.inscriptoAEliminar.idInscripto).subscribe({
      next: () => { this.cargarDatos(); this.cerrarModalEliminar(); },
      error: () => { alert('Error al eliminar el inscripto'); this.cerrarModalEliminar(); }
    });
  }

  private descargarBlob(blob: Blob, nombre: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  descargarTodos(): void {
    this.inscripcionService.exportarTodos().subscribe({
      next: (blob) => this.descargarBlob(blob, `inscriptos_todos_${Date.now()}.xlsx`),
      error: () => alert('Error al descargar')
    });
    this.mostrarModalDescarga = false;
  }

  descargarPrograma(): void {
    if (!this.filtroProgramaId()) return;
    this.inscripcionService.exportarPorPrograma(this.filtroProgramaId()!).subscribe({
      next: (blob) => this.descargarBlob(blob, `inscriptos_programa_${this.filtroProgramaId()}_${Date.now()}.xlsx`),
      error: () => alert('Error al descargar')
    });
    this.mostrarModalDescarga = false;
  }

  descargarComision(): void {
    if (!this.filtroComisionId()) return;
    this.inscripcionService.exportarPorComision(this.filtroComisionId()!).subscribe({
      next: (blob) => this.descargarBlob(blob, `inscriptos_comision_${this.filtroComisionId()}_${Date.now()}.xlsx`),
      error: () => alert('Error al descargar')
    });
    this.mostrarModalDescarga = false;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}