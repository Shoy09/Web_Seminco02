export interface Usuario {
  id?: number;
  codigo_dni: string;
  apellidos: string;
  nombres: string;
  cargo?: string;               // Ahora opcional
  area?: string;                // Nuevo campo opcional
  clasificacion?: string;       // Nuevo campo opcional
  empresa?: string;             // Opcional
  guardia?: string;             // Opcional
  autorizado_equipo?: string;   // Opcional
  correo?: string;              // Opcional
  password?: string;            // Solo necesario en la creación
}
