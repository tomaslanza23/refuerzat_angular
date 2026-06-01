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

  getAllInscriptos(): Observable<Inscripto[]> {
    return this.http.get<Inscripto[]>(this.adminApi);
  }

  getInscripto(id: number): Observable<Inscripto> {
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
  }): Observable<Inscripto> {
    return this.http.put<Inscripto>(`${this.adminApi}/${id}`, data);
  }

  cambiarComision(id: number, nuevaComisionId: number): Observable<Inscripto> {
    return this.http.patch<Inscripto>(`${this.adminApi}/${id}/cambiar-comision`, { nuevaComisionId });
  }

  completarFormacion(id: number): Observable<Inscripto> {
    return this.http.patch<Inscripto>(`${this.adminApi}/${id}/completar`, {});
  }

  reactivarFormacion(id: number): Observable<Inscripto> {
    return this.http.patch<Inscripto>(`${this.adminApi}/${id}/reactivar`, {});
  }

  eliminarInscripto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminApi}/${id}`);
  }

  exportarTodos(): Observable<Blob> {
    return this.http.get(`${this.adminApi}/excel/todos`, { responseType: 'blob' });
  }

  exportarPorPrograma(programaId: number): Observable<Blob> {
    return this.http.get(`${this.adminApi}/excel/programa/${programaId}`, { responseType: 'blob' });
  }

  exportarPorComision(comisionId: number): Observable<Blob> {
    return this.http.get(`${this.adminApi}/excel/comision/${comisionId}`, { responseType: 'blob' });
  }
}