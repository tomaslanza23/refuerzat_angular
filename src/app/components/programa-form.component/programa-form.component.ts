import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { ProgramaService } from '../../services/programa.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-programa-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './programa-form.component.html',
  styleUrl: './programa-form.component.css'
})
export class ProgramaFormComponent implements OnInit {

  form: FormGroup;
  error?: string;
  idPrograma?: number;
  esEdicion = false;
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private programaService: ProgramaService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      tipoFormacion: ['', Validators.required],
      imagenUrl: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion = true;
      this.idPrograma = Number(id);
      this.cargarPrograma(this.idPrograma);
    } else {
      this.form.removeControl('activo');
    }
  }

  private cargarPrograma(id: number): void {
    this.cargando = true;
    this.programaService.getProgramaById(id).subscribe({
      next: (programa) => {
        this.form.patchValue({
          nombre: programa.nombre,
          descripcion: programa.descripcion ?? '',
          tipoFormacion: programa.tipoFormacion,
          imagenUrl: programa.imagenUrl ?? '',
          activo: programa.activo
        });
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar el programa';
        this.cargando = false;
      }
    });
  }

  cancelar(): void { this.router.navigate(['/admin/programas']); }

  guardar(): void {
    this.error = undefined;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.esEdicion ? this.actualizar() : this.crear();
  }

  private crear(): void {
    const data = this.form.getRawValue();
    this.programaService.crearPrograma({
      nombre: data.nombre,
      descripcion: data.descripcion,
      tipoFormacion: data.tipoFormacion,
      imagenUrl: data.imagenUrl
    }).subscribe({
      next: () => this.router.navigate(['/admin/programas']),
      error: err => {
        this.error = err.error?.field === 'nombre'
          ? 'Ya existe un programa con ese nombre'
          : 'Error al crear el programa';
      }
    });
  }

  private actualizar(): void {
    if (!this.idPrograma) return;
    const data = this.form.getRawValue();
    this.programaService.actualizarPrograma(this.idPrograma, {
      nombre: data.nombre,
      descripcion: data.descripcion,
      tipoFormacion: data.tipoFormacion,
      imagenUrl: data.imagenUrl,
      activo: data.activo
    }).subscribe({
      next: () => this.router.navigate(['/admin/programas']),
      error: err => {
        const field = err.error?.field;
        if (field === 'nombre') this.error = 'Ya existe un programa con ese nombre';
        else if (field === 'activo') this.error = 'No se puede desactivar un programa con comisiones activas';
        else this.error = 'Error al actualizar el programa';
      }
    });
  }
}