export interface Comision {
  idComision: number;
  codigoComision: string;
  programaId: number;
  programaNombre?: string;
  dias: string;
  horario: string;
  lugar: string;
  turno: string;
  cupoTotal: number;
  cuposOcupados: number;
  cuposDisponibles?: number;
  activa: boolean;
}
