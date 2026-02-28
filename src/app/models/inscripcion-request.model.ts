export interface InscripcionRequest {
  nombre: string;
  apellido: string;
  dni: string;
  correoElectronico: string;
  telefonoCelular?: string;
  direccion?: string;
  comuna: string;
  etapaEmprendimiento: string;
  sectorEmprendimiento: string;
  nombreEmprendimiento?: string;
  programaId: number;
  comisionId: number;
}
