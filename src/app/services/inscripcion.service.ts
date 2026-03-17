import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/env';
import { InscripcionRequest } from '../models/inscripcion-request.model';
import { Inscripto } from '../models/inscripto.model';

@Injectable({ providedIn: 'root' })
export class InscripcionService {

  private api = `${environment.apiUrl}/inscripciones`;
  private adminApi = `${environment.apiUrl}/admin/inscriptos`;

  constructor(private http: HttpClient) {}

  crear(request: InscripcionRequest) {
    return this.http.post(this.api, request);
  }

  getAllInscriptos() {
    return this.http.get<Inscripto[]>(this.adminApi);
  }

  getInscripto(id: number) {
    return this.http.get<Inscripto>(`${this.adminApi}/${id}`);
  }

  actualizarInscripto(id: number, data: {
    nombre: string;
    apellido: string;
    correoElectronico: string;
    telefonoCelular?: string;
    direccion?: string;
    comuna: string;
    etapaEmprendimiento: string;
    sectorEmprendimiento: string;
    nombreEmprendimiento?: string;
    comisionId: number;
  }) {
    return this.http.put<Inscripto>(`${this.adminApi}/${id}`, data);
  }

  eliminarInscripto(id: number) {
    return this.http.delete(`${this.adminApi}/${id}`);
  }

  exportarTodos(): Observable<Blob> {
    return this.http.get(`${this.adminApi}/excel/todos`, {
      responseType: 'blob'
    });
  }

  exportarPorPrograma(programaId: number): Observable<Blob> {
    return this.http.get(`${this.adminApi}/excel/programa/${programaId}`, {
      responseType: 'blob'
    });
  }

  exportarPorComision(comisionId: number): Observable<Blob> {
    return this.http.get(`${this.adminApi}/excel/comision/${comisionId}`, {
      responseType: 'blob'
    });
  }
}