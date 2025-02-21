export interface Usuario {
    id?: number;
    codigo_dni: string;
    apellidos: string;
    nombres: string;
    cargo: string;
    empresa: string;
    guardia: string;
    autorizado_equipo: string;
    correo: string;
    password?: string; 
  }