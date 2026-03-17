import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  styleUrls: ['./inscriptos-list.component.css']
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

  mostrarModalDescarga = false;
  mostrarModalEliminar = false;
  inscriptoAEliminar: Inscripto | null = null;

  inscriptosFiltrados = computed(() => {
    let resultado = this.inscriptos();

    if (this.filtroProgramaId()) {
      resultado = resultado.filter(i => i.programaId === this.filtroProgramaId());
    }

    if (this.filtroComisionId()) {
      resultado = resultado.filter(i => i.comisionId === this.filtroComisionId());
    }

    const termino = this.searchTerm().toLowerCase().trim();
    if (termino) {
      resultado = resultado.filter(i =>
        i.nombre.toLowerCase().includes(termino) ||
        i.apellido.toLowerCase().includes(termino) ||
        i.dni.includes(termino) ||
        i.correoElectronico.toLowerCase().includes(termino) ||
        i.programaNombre?.toLowerCase().includes(termino) ||
        i.comisionCodigo?.toLowerCase().includes(termino)
      );
    }

    return resultado;
  });

  contadores = computed(() => ({
    total: this.inscriptos().length,
    filtrados: this.inscriptosFiltrados().length
  }));

  constructor(
    private inscripcionService: InscripcionService,
    private programaService: ProgramaService,
    private comisionService: ComisionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);
    this.error.set(null);

    Promise.all([
      this.inscripcionService.getAllInscriptos().toPromise(),
      this.programaService.getAllProgramas().toPromise(),
      this.comisionService.getAllComisiones().toPromise()
    ]).then(([inscriptos, programas, comisiones]) => {
      this.inscriptos.set((inscriptos as Inscripto[]) || []);
      this.programas.set((programas as Programa[]) || []);
      this.comisiones.set((comisiones as Comision[]) || []);
      this.loading.set(false);
    }).catch(() => {
      this.error.set('Error al cargar los datos');
      this.loading.set(false);
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

  abrirModalEliminar(inscripto: Inscripto): void {
    this.inscriptoAEliminar = inscripto;
    this.mostrarModalEliminar = true;
  }

  cerrarModalEliminar(): void {
    this.mostrarModalEliminar = false;
    this.inscriptoAEliminar = null;
  }

  confirmarEliminar(): void {
    if (!this.inscriptoAEliminar) return;

    this.inscripcionService.eliminarInscripto(this.inscriptoAEliminar.idInscripto).subscribe({
      next: () => {
        this.cargarDatos();
        this.cerrarModalEliminar();
      },
      error: () => {
        alert('Error al eliminar el inscripto');
        this.cerrarModalEliminar();
      }
    });
  }

  abrirModalDescarga(): void {
    this.mostrarModalDescarga = true;
  }

  cerrarModalDescarga(): void {
    this.mostrarModalDescarga = false;
  }

  descargarExcelTodos(): void {
  this.inscripcionService.exportarTodos().subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inscriptos_todos_${new Date().getTime()}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Error al exportar:', err);
      alert('Error al descargar el archivo Excel');
    }
  });
}

descargarExcelPrograma(): void {
  if (this.filtroProgramaId()) {
    this.inscripcionService.exportarPorPrograma(this.filtroProgramaId()!).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inscriptos_programa_${this.filtroProgramaId()}_${new Date().getTime()}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al exportar:', err);
        alert('Error al descargar el archivo Excel');
      }
    });
  }
}

descargarExcelComision(): void {
  if (this.filtroComisionId()) {
    this.inscripcionService.exportarPorComision(this.filtroComisionId()!).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inscriptos_comision_${this.filtroComisionId()}_${new Date().getTime()}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al exportar:', err);
        alert('Error al descargar el archivo Excel');
      }
    });
  }
}

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }


}
