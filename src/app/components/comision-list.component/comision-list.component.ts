import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ComisionService } from '../../services/comision.service';
import { ProgramaService } from '../../services/programa.service';
import { Comision } from '../../models/comision.model';
import { Programa } from '../../models/programa.model';

@Component({
  selector: 'app-comision-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comision-list.component.html',
  styleUrl: './comision-list.component.css'
})
export class ComisionListComponent implements OnInit {

  comisiones = signal<Comision[]>([]);
  programas = signal<Programa[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  searchTerm = signal('');
  filtroActivo = signal<'todas' | 'activas' | 'inactivas'>('todas');
  filtroProgramaId = signal<number | null>(null);

  comisionParaCambiar: Comision | null = null;

  comisionesFiltradas = computed(() => {
    let resultado = this.comisiones();

    if (this.filtroProgramaId()) {
      resultado = resultado.filter(c => c.programaId === this.filtroProgramaId());
    }
    if (this.filtroActivo() === 'activas') resultado = resultado.filter(c => c.activa);
    if (this.filtroActivo() === 'inactivas') resultado = resultado.filter(c => !c.activa);

    const termino = this.searchTerm().toLowerCase().trim();
    if (termino) {
      resultado = resultado.filter(c =>
        c.codigoComision.toLowerCase().includes(termino) ||
        c.programaNombre?.toLowerCase().includes(termino) ||
        c.dias?.toLowerCase().includes(termino) ||
        c.horario?.toLowerCase().includes(termino) ||
        c.lugar?.toLowerCase().includes(termino)
      );
    }
    return resultado;
  });

  contadores = computed(() => ({
    todas: this.comisiones().length,
    activas: this.comisiones().filter(c => c.activa).length,
    inactivas: this.comisiones().filter(c => !c.activa).length
  }));

  constructor(
    private comisionService: ComisionService,
    private programaService: ProgramaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      programas: this.programaService.getAllProgramas(),
      comisiones: this.comisionService.getAllComisiones()
    }).subscribe({
      next: ({ programas, comisiones }) => {
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

  cambiarFiltro(filtro: 'todas' | 'activas' | 'inactivas'): void {
    this.filtroActivo.set(filtro);
  }

  cambiarFiltroPrograma(programaId: string): void {
    this.filtroProgramaId.set(programaId ? Number(programaId) : null);
  }

  nuevaComision(): void { this.router.navigate(['/admin/comisiones/nueva']); }
  editarComision(id: number): void { this.router.navigate([`/admin/comisiones/editar/${id}`]); }

  confirmarCambioEstado(comision: Comision): void { this.comisionParaCambiar = comision; }
  cerrarModal(): void { this.comisionParaCambiar = null; }

  ejecutarCambioEstado(): void {
    if (!this.comisionParaCambiar) return;
    const comision = this.comisionParaCambiar;

    this.comisionService.actualizarComision(comision.idComision, {
      codigoComision: comision.codigoComision,
      dias: comision.dias,
      horario: comision.horario,
      lugar: comision.lugar,
      turno: comision.turno,
      cupoTotal: comision.cupoTotal,
      activa: !comision.activa
    }).subscribe({
      next: () => { this.cargarDatos(); this.cerrarModal(); },
      error: (err) => {
        alert(err.error?.message ?? 'Error al cambiar el estado');
        this.cerrarModal();
      }
    });
  }

  getPorcentajeCupo(comision: Comision): number {
    if (!comision.cupoTotal) return 0;
    return Math.min(100, (comision.cuposOcupados / comision.cupoTotal) * 100);
  }

  getClaseCupo(comision: Comision): string {
    const p = this.getPorcentajeCupo(comision);
    if (p >= 100) return 'cupo-completo';
    if (p >= 80) return 'cupo-casi-lleno';
    if (p >= 50) return 'cupo-medio';
    return 'cupo-disponible';
  }
}