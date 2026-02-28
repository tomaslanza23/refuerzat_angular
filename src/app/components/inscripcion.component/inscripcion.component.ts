import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProgramaService } from '../../services/programa.service';
import { ComisionService } from '../../services/comision.service';
import { InscripcionService } from '../../services/inscripcion.service';
import { Programa } from '../../models/programa.model';
import { Comision } from '../../models/comision.model';
import { InscripcionRequest } from '../../models/inscripcion-request.model';
import { COMUNAS } from '../../constants/comunas';
import { ETAPAS_EMPRENDIMIENTO } from '../../constants/etapas-emprendimiento';
import { SECTORES } from '../../constants/sectores';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inscripcion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './inscripcion.component.html',
  styleUrls: ['./inscripcion.component.css']
})
export class InscripcionComponent implements OnInit {
  form!: FormGroup;
  programas: Programa[] = [];
  comisiones: Comision[] = [];
  comunas = COMUNAS;
  etapas = ETAPAS_EMPRENDIMIENTO;
  sectores = SECTORES;
  loading = false;
  exito = false;
  errores: { [key: string]: string } = {};
  errorGeneral: string | null = null;
  mostrarModalBienvenida = true;
  programaSeleccionadoTemporal: Programa | null = null;
  programaPreseleccionado = false;

  constructor(
    private fb: FormBuilder,
    private programaService: ProgramaService,
    private comisionService: ComisionService,
    private inscripcionService: InscripcionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarProgramas();
    this.escucharCambiosPrograma();
  }

  private initForm(): void {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      dni: ['', Validators.required],
      correoElectronico: ['', [Validators.required, Validators.email]],
      telefonoCelular: ['', Validators.required],
      direccion: ['', Validators.required],
      nombreEmprendimiento: ['', Validators.required],
      sectorEmprendimiento: ['', Validators.required],
      comuna: ['', Validators.required],
      etapaEmprendimiento: ['', Validators.required],
      programaId: ['', Validators.required],
      comisionId: ['', Validators.required]
    });
  }

  private cargarProgramas(): void {
    this.programaService.getProgramas()
      .subscribe(programas => {
        this.programas = programas;
      });
  }

  private escucharCambiosPrograma(): void {
    this.form.get('programaId')?.valueChanges.subscribe(programaId => {
      this.comisiones = [];
      this.form.get('comisionId')?.reset();

      if (programaId) {
        this.comisionService.getByPrograma(programaId)
          .subscribe(comisiones => {
            this.comisiones = comisiones;
          });
      }
    });
  }

  seleccionarProgramaInicial(programa: Programa): void {
    this.programaSeleccionadoTemporal = programa;
  }

  confirmarSeleccionPrograma(): void {
    if (this.programaSeleccionadoTemporal) {
      this.form.patchValue({
        programaId: this.programaSeleccionadoTemporal.idPrograma
      });

      this.programaPreseleccionado = true;
      this.cerrarModal();
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    }
  }

  cerrarModal(): void {
    this.mostrarModalBienvenida = false;
  }


getImagenPrograma(programa: Programa): string {
  if (programa.imagenUrl && programa.imagenUrl.trim()) {
    return programa.imagenUrl;
  }
  return 'assets/imagenes/programas/programa-default.jpg';
}

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/800x600/667eea/ffffff?text=Programa+RefuerzaT';
  }

  soloLetras(event: Event, fieldName: string): void {
    const input = event.target as HTMLInputElement;
    const valorLimpio = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '');
    input.value = valorLimpio;
    this.form.get(fieldName)?.setValue(valorLimpio, { emitEvent: false });
  }

  soloNumeros(event: Event, fieldName: string, maxLength?: number): void {
    const input = event.target as HTMLInputElement;
    let valorLimpio = input.value.replace(/[^0-9]/g, '');

    if (maxLength && valorLimpio.length > maxLength) {
      valorLimpio = valorLimpio.slice(0, maxLength);
    }

    input.value = valorLimpio;
    this.form.get(fieldName)?.setValue(valorLimpio, { emitEvent: false });
  }

onSubmit(): void {
  this.errores = {};
  this.errorGeneral = null;

  if (this.form.invalid) {
    this.errorGeneral = 'Por favor, completá todos los campos obligatorios';
    this.form.markAllAsTouched();
    setTimeout(() => {
      const firstInvalidControl = document.querySelector('.ng-invalid:not(form)');
      if (firstInvalidControl) {
        firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (firstInvalidControl as HTMLElement).focus();
      }
    }, 100);
    return;
  }

  this.loading = true;
  this.exito = false;

  const request: InscripcionRequest = this.form.value;

  this.inscripcionService.crear(request)
    .subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/exito']);
      },
      error: err => {
        this.loading = false;
        const errorBody = err?.error;

        if (errorBody?.field && errorBody?.message) {
          this.errores[errorBody.field] = errorBody.message;
          this.form.get(errorBody.field)?.setErrors({ api: errorBody.message });
          const fieldEl = document.querySelector(`[formControlName="${errorBody.field}"]`);
          fieldEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          this.errorGeneral = errorBody?.message || 'Ocurrió un error al procesar la inscripción';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });
}
mostrarAlertaComplementaria(): boolean {
  const programaId = this.form.get('programaId')?.value;
  if (!programaId) return false;

  const programa = this.programas.find(p => p.idPrograma === Number(programaId));
  return programa?.tipoFormacion === 'COMPLEMENTARIA';
}
  mostrarError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  obtenerMensajeError(fieldName: string): string {
    const field = this.form.get(fieldName);
  if (this.errores[fieldName]) {
    if (this.errores[fieldName] === 'requiereTroncal' ||
        (fieldName === 'programaId' && this.errores['requiereTroncal'])) {
      return 'Debes estar cursando o haber completado una Formación Troncal para inscribirte a Jornadas Complementarias';
    }
    if (this.errores[fieldName]) {
      return this.errores[fieldName];
    }

    if (field?.errors?.['required']) {
      return 'Este campo es obligatorio';
    }

    if (field?.errors?.['email']) {
      return 'Ingresá un correo electrónico válido';
    }

    if (field?.errors?.['api']) {
      return field.errors['api'];
    }
    switch (fieldName) {
      case 'dni': return 'Ya existe una inscripción con este DNI';
      case 'programaId': return 'El programa seleccionado no está disponible';
      case 'comisionId': return 'La comisión seleccionada no está disponible o no tiene cupos';
      case 'correoElectronico': return 'El correo electrónico es inválido';
      default: return this.errores[fieldName];
    }
  }
  return '';
}
}
