// Tipos de los DTOs del backend (vista de desarrollo, Fase 3). Las fechas viajan como texto ISO: "2026-11-16".

export type Sexo = 'MACHO' | 'HEMBRA'
export type Proposito = 'ENGORDE' | 'PADRON' | 'LECHE'
export type Rol = 'GANADERO' | 'ADMINISTRADOR'
export type TipoEventoSanitario = 'VACUNA' | 'ENFERMEDAD' | 'TRATAMIENTO'
export type EstadoActividad = 'PROGRAMADA' | 'REALIZADA'

export interface IngresoRequest { correo: string; contrasena: string }
export interface CuentaRequest { nombreFinca: string; nombre: string; correo: string; contrasena: string }
export interface AnimalRequest { codigoArete: string; nombre: string; sexo: Sexo; fechaNacimiento: string | null; proposito: Proposito }
export interface EventoSanitarioRequest { tipo: TipoEventoSanitario; descripcion: string; fechaProgramada: string | null; fechaRealizacion: string | null; observaciones: string }
export interface PesoRequest { pesoKg: number; fechaMedicion: string }
export interface PartoRequest { codigoAreteMadre: string; fecha: string; crias: AnimalRequest[] }
export interface ReporteRequest { tipo: string; codigoArete: string }
export interface LecheRequest { codigoArete: string; fechaParto: string; fecha: string; litros: number }

export interface SesionResponse { nombre: string; rol: Rol; nombreFinca: string }
export interface UsuarioResponse { nombre: string; correo: string; rol: Rol; activo: boolean }
export interface AnimalResponse { codigoArete: string; nombre: string; sexo: Sexo; edadMeses: number | null; proposito: Proposito }
export interface EventoSanitarioResponse { tipo: TipoEventoSanitario; descripcion: string; fechaProgramada: string | null; fechaRealizacion: string | null; estado: EstadoActividad; observaciones: string }
export interface PesoResponse { pesoKg: number; fechaMedicion: string; diferenciaKg: number | null }
export interface PartoResponse { fecha: string; crias: AnimalResponse[] }
export interface ReporteResponse { tipo: string; fechaGeneracion: string; filas: string[] }
export interface LecheResponse { fecha: string; litros: number }
export interface PromedioLecheResponse { periodo: string; diasConRegistro: number; totalLitros: number; promedioDiario: number; registros: LecheResponse[] }
