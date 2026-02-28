import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
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
  styleUrls: ['./inscriptos-form.component.css']
})
export class InscriptosFormComponent implements OnInit {

  form: FormGroup;
  error?: string;
  comisiones: Comision[] = [];
  comisionesDelPrograma: Comision[] = [];

  comunas = COMUNAS;
  etapas = ETAPAS_EMPRENDIMIENTO;
  sectores = SECTORES;

  idInscripto!: number;
  inscriptoOriginal?: Inscripto;
  cargando = false;
  programaIdOriginal?: number;

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
        this.programaIdOriginal = inscripto.programaId;

        this.form.patchValue({
          nombre: inscripto.nombre,
          apellido: inscripto.apellido,
          correoElectronico: inscripto.correoElectronico,
          telefonoCelular: inscripto.telefonoCelular,
          direccion: inscripto.direccion,
          comuna: inscripto.comuna,
          etapaEmprendimiento: inscripto.etapaEmprendimiento,
          sectorEmprendimiento: inscripto.sectorEmprendimiento,
          nombreEmprendimiento: inscripto.nombreEmprendimiento,
          comisionId: inscripto.comisionId
        });

        this.cargarComisionesDelPrograma(inscripto.programaId!);
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar el inscripto';
        this.cargando = false;
      }
    });
  }

  private cargarComisionesDelPrograma(programaId: number): void {
    this.comisionService.getAllComisiones(programaId).subscribe({
      next: (comisiones) => {
        this.comisionesDelPrograma = comisiones as Comision[];
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/admin/inscriptos']);
  }

  guardar(): void {
    this.error = undefined;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = this.form.getRawValue();

    this.inscripcionService.actualizarInscripto(this.idInscripto, data).subscribe({
      next: () => this.router.navigate(['/admin/inscriptos']),
      error: err => {
        this.error = 'Error al actualizar el inscripto';
      }
    });
  }
}
