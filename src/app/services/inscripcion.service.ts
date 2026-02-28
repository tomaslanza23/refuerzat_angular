import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/env';
import { InscripcionRequest } from '../models/inscripcion-request.model';
import { Inscripto } from '../models/inscripto.model';

@Injectable({ providedIn: 'root' })
export class InscripcionService {

  private api = `${environment.apiUrl}/inscripciones`;
  private adminApi = `${environment.apiUrl}/admin/inscriptos`;

  constructor(private http: HttpClient) {}

  /**
   * ENDPOINT PÚBLICO
   */
  crear(request: InscripcionRequest) {
    return this.http.post(this.api, request);
  }

  /**
   * ENDPOINTS ADMIN - CRUD
   */
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

  /**
   * ENDPOINTS DE EXCEL
   */
  descargarExcelTodos(): void {
    const url = `${this.adminApi}/excel/todos`;
    this.descargarArchivo(url);
  }

  descargarExcelPorComision(comisionId: number): void {
    const url = `${this.adminApi}/excel/comision/${comisionId}`;
    this.descargarArchivo(url);
  }

  descargarExcelPorPrograma(programaId: number): void {
    const url = `${this.adminApi}/excel/programa/${programaId}`;
    this.descargarArchivo(url);
  }

  private descargarArchivo(url: string): void {
    window.open(url, '_blank');
  }
}
