import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ComisionService } from '../../services/comision.service';
import { ProgramaService } from '../../services/programa.service';
import { Comision } from '../../models/comision.model';
import { Programa } from '../../models/programa.model';

@Component({
  selector: 'app-comision-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comision-list.component.html',
  styleUrls: ['./comision-list.component.css']
})
export class ComisionListComponent implements OnInit {

  comisiones = signal<Comision[]>([]);
  programas = signal<Programa[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  searchTerm = signal('');
  filtroActivo = signal<'todas' | 'activas' | 'inactivas'>('todas');
  filtroProgramaId = signal<number | null>(null);

  mostrarModalConfirmacion = false;
  comisionParaCambiar: Comision | null = null;

  comisionesFiltradas = computed(() => {
    let resultado = this.comisiones();

    if (this.filtroProgramaId()) {
      resultado = resultado.filter(c => c.programaId === this.filtroProgramaId());
    }

    if (this.filtroActivo() === 'activas') {
      resultado = resultado.filter(c => c.activa);
    } else if (this.filtroActivo() === 'inactivas') {
      resultado = resultado.filter(c => !c.activa);
    }

    const termino = this.searchTerm().toLowerCase().trim();
    if (termino) {
      resultado = resultado.filter(c =>
        c.codigoComision.toLowerCase().includes(termino) ||
        c.programaNombre?.toLowerCase().includes(termino) ||
        c.dias.toLowerCase().includes(termino) ||
        c.horario.toLowerCase().includes(termino) ||
        c.lugar.toLowerCase().includes(termino)
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

    Promise.all([
      this.programaService.getAllProgramas().toPromise(),
      this.comisionService.getAllComisiones().toPromise()
    ]).then(([programas, comisiones]) => {
      this.programas.set((programas as Programa[]) || []);
      this.comisiones.set((comisiones as Comision[]) || []);
      this.loading.set(false);
    }).catch(() => {
      this.error.set('Error al cargar los datos');
      this.loading.set(false);
    });
  }

  cambiarFiltro(filtro: 'todas' | 'activas' | 'inactivas'): void {
    this.filtroActivo.set(filtro);
  }

  cambiarFiltroPrograma(programaId: string): void {
    this.filtroProgramaId.set(programaId ? Number(programaId) : null);
  }

  nuevaComision(): void {
    this.router.navigate(['/admin/comisiones/nueva']);
  }

  editarComision(id: number): void {
    this.router.navigate([`/admin/comisiones/editar/${id}`]);
  }

  abrirModalCambioEstado(comision: Comision): void {
    this.comisionParaCambiar = comision;
    this.mostrarModalConfirmacion = true;
  }

  cerrarModal(): void {
    this.mostrarModalConfirmacion = false;
    this.comisionParaCambiar = null;
  }

  ejecutarCambioEstado(): void {
    if (!this.comisionParaCambiar) return;

    const comision = this.comisionParaCambiar;
    const nuevoEstado = !comision.activa;

    this.comisionService.actualizarComision(comision.idComision, {
      codigoComision: comision.codigoComision,
      dias: comision.dias,
      horario: comision.horario,
      lugar: comision.lugar,
      turno: comision.turno,
      cupoTotal: comision.cupoTotal,
      activa: nuevoEstado
    }).subscribe({
      next: () => {
        this.cargarDatos();
        this.cerrarModal();
      },
      error: (err) => {
        if (err.error === 'activa') {
          alert('No se puede desactivar una comisión con inscriptos');
        } else {
          alert('Error al cambiar el estado de la comisión');
        }
        this.cerrarModal();
      }
    });
  }

  getPorcentajeCupo(comision: Comision): number {
    return (comision.cuposOcupados / comision.cupoTotal) * 100;
  }

  getClaseCupo(comision: Comision): string {
    const porcentaje = this.getPorcentajeCupo(comision);
    if (porcentaje >= 100) return 'completo';
    if (porcentaje >= 80) return 'casi-lleno';
    if (porcentaje >= 50) return 'medio';
    return 'disponible';
  }
}
