import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscripcionService } from '../../services/inscripcion.service';
import { ComisionService } from '../../services/comision.service';
import { ProgramaService } from '../../services/programa.service';
import { Comision } from '../../models/comision.model';
import { Programa } from '../../models/programa.model';

@Component({
  selector: 'app-inscriptos-descargas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inscriptos-descargas.component.html',
  styleUrls: ['./inscriptos-descargas.component.css']
})
export class InscriptosDescargasComponent implements OnInit {

  programas = signal<Programa[]>([]);
  comisiones = signal<Comision[]>([]);

  programaSeleccionado?: number;
  comisionSeleccionada?: number;

  constructor(
    private inscripcionService: InscripcionService,
    private comisionService: ComisionService,
    private programaService: ProgramaService
  ) {}

  ngOnInit(): void {
    this.cargarProgramas();
    this.cargarComisiones();
  }

  cargarProgramas(): void {
    this.programaService.getAllProgramas().subscribe({
      next: (programas) => this.programas.set(programas)
    });
  }

  cargarComisiones(): void {
    this.comisionService.getAllComisiones().subscribe({
      next: (comisiones) => this.comisiones.set(comisiones as Comision[])
    });
  }

  descargarTodos(): void {
    this.inscripcionService.descargarExcelTodos();
  }

  descargarPorPrograma(): void {
    if (this.programaSeleccionado) {
      this.inscripcionService.descargarExcelPorPrograma(this.programaSeleccionado);
    }
  }

  descargarPorComision(): void {
    if (this.comisionSeleccionada) {
      this.inscripcionService.descargarExcelPorComision(this.comisionSeleccionada);
    }
  }
}
