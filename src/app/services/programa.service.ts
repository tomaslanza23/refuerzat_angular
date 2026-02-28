import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/env';
import { Programa } from '../models/programa.model';

@Injectable({ providedIn: 'root' })
export class ProgramaService {

  private api = `${environment.apiUrl}/programas`;
  private adminApi = `${environment.apiUrl}/admin/programas`;

  constructor(private http: HttpClient) {}

  getProgramas() {
    return this.http.get<Programa[]>(this.api);
  }

  getAllProgramas() {
    return this.http.get<Programa[]>(this.adminApi);
  }

  crearPrograma(data: {
    nombre: string;
    descripcion?: string;
    tipoFormacion: 'TRONCAL' | 'COMPLEMENTARIA';
    imagenUrl?: string;
  }) {
    return this.http.post<Programa>(this.adminApi, data);
  }

  actualizarPrograma(
    id: number,
    data: {
      nombre: string;
      descripcion?: string;
      tipoFormacion: 'TRONCAL' | 'COMPLEMENTARIA';
      imagenUrl?: string;
      activo: boolean;
    }
  ) {
    return this.http.put<Programa>(`${this.adminApi}/${id}`, data);
  }
}
