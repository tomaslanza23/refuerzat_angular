export interface Programa {
  idPrograma: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  imagenUrl?: string;
  tipoFormacion: 'TRONCAL' | 'COMPLEMENTARIA';
}
