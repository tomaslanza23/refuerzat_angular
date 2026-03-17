import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { ComisionService } from '../../services/comision.service';
import { ProgramaService } from '../../services/programa.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Comision } from '../../models/comision.model';
import { Programa } from '../../models/programa.model';

@Component({
  standalone: true,
  selector: 'app-comision-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './comision-form.component.html',
  styleUrls: ['./comision-form.component.css']
})
export class ComisionFormComponent implements OnInit {

  form: FormGroup;
  error?: string;
  programas: Programa[] = [];

  idComision?: number;
  esEdicion = false;
  cargando = false;
  cuposOcupadosOriginales = 0;

  constructor(
    private fb: FormBuilder,
    private comisionService: ComisionService,
    private programaService: ProgramaService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      codigoComision: ['', Validators.required],
      programaId: ['', Validators.required],
      dias: ['', Validators.required],
      horario: ['', Validators.required],
      lugar: ['', Validators.required],
      turno: ['', Validators.required],
      cupoTotal: [1, [Validators.required, Validators.min(1)]],
      activa: [true]
    });
  }

  ngOnInit(): void {
    this.cargarProgramas();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion = true;
      this.idComision = Number(id);
      this.cargarComision(this.idComision);
    } else {
      this.form.removeControl('activa');
    }
  }

  private cargarProgramas(): void {
    this.programaService.getAllProgramas().subscribe({
      next: (programas) => {
        this.programas = programas.filter(p => p.activo);
      },
      error: () => {
        this.error = 'Error al cargar los programas';
      }
    });
  }

  private cargarComision(id: number): void {
    this.cargando = true;

    this.comisionService.getComision(id).subscribe({
      next: (comision) => {
        this.cuposOcupadosOriginales = comision.cuposOcupados;

        this.form.patchValue({
          codigoComision: comision.codigoComision,
          programaId: comision.programaId,
          dias: comision.dias,
          horario: comision.horario,
          lugar: comision.lugar,
          turno: comision.turno,
          cupoTotal: comision.cupoTotal,
          activa: comision.activa
        });

        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar la comisión';
        this.cargando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/admin/comision/nuevo']);
  }

  guardar(): void {
    this.error = undefined;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.esEdicion) {
      const nuevoCupo = this.form.get('cupoTotal')?.value;
      if (nuevoCupo < this.cuposOcupadosOriginales) {
        this.error = `El cupo total no puede ser menor a los cupos ocupados (${this.cuposOcupadosOriginales})`;
        return;
      }
    }

    if (this.esEdicion) {
      this.actualizar();
    } else {
      this.crear();
    }
  }

  private crear(): void {
    const data = this.form.getRawValue();

    this.comisionService.crearComision({
      codigoComision: data.codigoComision,
      programaId: data.programaId,
      dias: data.dias,
      horario: data.horario,
      lugar: data.lugar,
      turno: data.turno,
      cupoTotal: data.cupoTotal
    }).subscribe({
      next: () => this.router.navigate(['/admin/comisiones']),
      error: err => {
        if (err.error === 'codigoComision') {
          this.error = 'Ya existe una comisión con ese código';
        } else if (err.error === 'programaId') {
          this.error = 'El programa seleccionado no existe o está inactivo';
        } else {
          this.error = 'Error al crear la comisión';
        }
      }
    });
  }

  private actualizar(): void {
    if (!this.idComision) return;

    const data = this.form.getRawValue();

    this.comisionService.actualizarComision(this.idComision, {
      codigoComision: data.codigoComision,
      dias: data.dias,
      horario: data.horario,
      lugar: data.lugar,
      turno: data.turno,
      cupoTotal: data.cupoTotal,
      activa: data.activa
    }).subscribe({
      next: () => this.router.navigate(['/admin/comisiones']),
      error: err => {
        if (err.error === 'codigoComision') {
          this.error = 'Ya existe una comisión con ese código';
        } else if (err.error === 'cupoTotal') {
          this.error = `El cupo total no puede ser menor a los cupos ocupados (${this.cuposOcupadosOriginales})`;
        } else if (err.error === 'activa') {
          this.error = 'No se puede desactivar una comisión con inscriptos';
        } else {
          this.error = 'Error al actualizar la comisión';
        }
      }
    });
  }

  getCuposDisponibles(): number {
    const total = this.form.get('cupoTotal')?.value || 0;
    return Math.max(0, total - this.cuposOcupadosOriginales);
  }
}
