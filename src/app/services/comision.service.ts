import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/env';
import { Comision } from '../models/comision.model';

@Injectable({ providedIn: 'root' })
export class ComisionService {

  private api = `${environment.apiUrl}/comisiones`;
  private adminApi = `${environment.apiUrl}/admin/comisiones`;

  constructor(private http: HttpClient) {}

  getByPrograma(programaId: number) {
    return this.http.get<Comision[]>(
      `${this.api}/programa/${programaId}`
    );
  }

  getAllComisiones(programaId?: number) {
    if (programaId) {
      return this.http.get<Comision[]>(this.adminApi, {
        params: { programaId: programaId.toString() }
      });
    }
    return this.http.get<Comision[]>(this.adminApi);
  }

  getComision(id: number) {
    return this.http.get<Comision>(`${this.adminApi}/${id}`);
  }

  crearComision(data: {
    codigoComision: string;
    programaId: number;
    dias: string;
    horario: string;
    lugar: string;
    turno: string;
    cupoTotal: number;
  }) {
    return this.http.post<Comision>(this.adminApi, data);
  }

  actualizarComision(
    id: number,
    data: {
      codigoComision: string;
      dias: string;
      horario: string;
      lugar: string;
      turno: string;
      cupoTotal: number;
      activa: boolean;
    }
  ) {
    return this.http.put<Comision>(`${this.adminApi}/${id}`, data);
  }
}
