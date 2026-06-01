import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { switchMap, of } from 'rxjs';
import { InscripcionService } from '../../services/inscripcion.service';
import { ComisionService } from '../../services/comision.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Inscripto } from '../../models/inscripto.model';
import { Comision } from '../../models/comision.model';
import { COMUNAS } from '../../constants/comunas';
import { ETAPAS_EMPRENDIMIENTO } from '../../constants/etapas-emprendimiento';
import { SECTORES } from '../../constants/sectores';

@Component({
  standalone: true,
  selector: 'app-inscriptos-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inscriptos-form.component.html',
  styleUrl: './inscriptos-form.component.css'
})
export class InscriptosFormComponent implements OnInit {

  form: FormGroup;
  error?: string;
  comisionesDelPrograma: Comision[] = [];

  comunas = COMUNAS;
  etapas = ETAPAS_EMPRENDIMIENTO;
  sectores = SECTORES;

  idInscripto!: number;
  inscriptoOriginal?: Inscripto;
  cargando = false;
  guardando = false;

  constructor(
    private fb: FormBuilder,
    private inscripcionService: InscripcionService,
    private comisionService: ComisionService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correoElectronico: ['', [Validators.required, Validators.email]],
      telefonoCelular: [''],
      direccion: [''],
      comuna: ['', Validators.required],
      etapaEmprendimiento: ['', Validators.required],
      sectorEmprendimiento: ['', Validators.required],
      nombreEmprendimiento: [''],
      comisionId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idInscripto = Number(id);
      this.cargarInscripto(this.idInscripto);
    }
  }

  private cargarInscripto(id: number): void {
    this.cargando = true;
    this.inscripcionService.getInscripto(id).subscribe({
      next: (inscripto) => {
        this.inscriptoOriginal = inscripto;
        this.form.patchValue({
          nombre: inscripto.nombre,
          apellido: inscripto.apellido,
          correoElectronico: inscripto.correoElectronico,
          telefonoCelular: inscripto.telefonoCelular ?? '',
          direccion: inscripto.direccion ?? '',
          comuna: inscripto.comuna,
          etapaEmprendimiento: inscripto.etapaEmprendimiento,
          sectorEmprendimiento: inscripto.sectorEmprendimiento,
          nombreEmprendimiento: inscripto.nombreEmprendimiento ?? '',
          comisionId: inscripto.comisionId
        });
        this.cargarComisionesDelPrograma(inscripto.programaId);
        this.cargando = false;
      },
      error: () => { this.error = 'Error al cargar el inscripto'; this.cargando = false; }
    });
  }

  private cargarComisionesDelPrograma(programaId: number): void {
    this.comisionService.getAllComisiones(programaId).subscribe({
      next: (comisiones) => { this.comisionesDelPrograma = comisiones; }
    });
  }

  cancelar(): void { this.router.navigate(['/admin/inscriptos']); }

  guardar(): void {
    this.error = undefined;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.guardando = true;
    const data = this.form.getRawValue();
    const comisionCambio = Number(data.comisionId) !== this.inscriptoOriginal?.comisionId;

    this.inscripcionService.actualizarInscripto(this.idInscripto, {
      nombre: data.nombre,
      apellido: data.apellido,
      correoElectronico: data.correoElectronico,
      telefonoCelular: data.telefonoCelular || undefined,
      direccion: data.direccion || undefined,
      comuna: data.comuna,
      etapaEmprendimiento: data.etapaEmprendimiento,
      sectorEmprendimiento: data.sectorEmprendimiento,
      nombreEmprendimiento: data.nombreEmprendimiento || undefined
    }).pipe(
      switchMap(() => comisionCambio
        ? this.inscripcionService.cambiarComision(this.idInscripto, Number(data.comisionId))
        : of(null)
      )
    ).subscribe({
      next: () => this.router.navigate(['/admin/inscriptos']),
      error: () => {
        this.error = 'Error al actualizar el inscripto';
        this.guardando = false;
      }
    });
  }

  cambiarEstado(completar: boolean): void {
    const obs = completar
      ? this.inscripcionService.completarFormacion(this.idInscripto)
      : this.inscripcionService.reactivarFormacion(this.idInscripto);

    obs.subscribe({
      next: (inscripto) => {
        if (this.inscriptoOriginal) {
          this.inscriptoOriginal = { ...this.inscriptoOriginal, estadoFormacion: inscripto.estadoFormacion };
        }
      },
      error: () => { this.error = 'Error al cambiar el estado'; }
    });
  }
}