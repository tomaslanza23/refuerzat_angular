export interface Inscripto {
  idInscripto: number;
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

  comisionId: number;
  comisionCodigo?: string;
  comisionDias?: string;
  comisionHorario?: string;
  comisionLugar?: string;

  programaId: number;
  programaNombre?: string;
  programaTipoFormacion?: 'TRONCAL' | 'COMPLEMENTARIA'; 

  fechaInscripcion: string;
  estadoFormacion: 'EN_CURSO' | 'COMPLETADA';
}

export interface InscriptoUpdateRequest {
  nombre: string;
  apellido: string;
  correoElectronico: string;
  telefonoCelular?: string;
  direccion?: string;
  comuna: string;
  etapaEmprendimiento: string;
  sectorEmprendimiento: string;
  nombreEmprendimiento?: string;
}

export interface CambiarComisionRequest {
  nuevaComisionId: number;
}
