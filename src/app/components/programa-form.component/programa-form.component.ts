import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { ProgramaService } from '../../services/programa.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Programa } from '../../models/programa.model';

@Component({
  standalone: true,
  selector: 'app-programa-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './programa-form.component.html',
  styleUrls: ['./programa-form.component.css']
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
    this.programaService.getAllProgramas().subscribe({
      next: (programas) => {
        const programa = programas.find(p => p.idPrograma === id);
        if (!programa) {
          this.error = 'Programa no encontrado';
          this.cargando = false;
          return;
        }

        this.form.patchValue({
          nombre: programa.nombre,
          descripcion: programa.descripcion,
          tipoFormacion: programa.tipoFormacion,
          imagenUrl: programa.imagenUrl,
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

  cancelar(): void {
    this.router.navigate(['/admin/programas']);
  }

  guardar(): void {
    this.error = undefined;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.esEdicion) {
      this.actualizar();
    } else {
      this.crear();
    }
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
        this.error = err.error === 'nombre'
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
        if (err.error === 'nombre') {
          this.error = 'Ya existe un programa con ese nombre';
        } else if (err.error === 'activo') {
          this.error = 'No se puede desactivar un programa con comisiones activas';
        } else {
          this.error = 'Error al actualizar el programa';
        }
      }
    });
  }
}