import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-rendimiento-de-perforaciones',
  standalone: true,
  imports: [],
  templateUrl: './rendimiento-de-perforaciones.component.html',
  styleUrls: ['./rendimiento-de-perforaciones.component.css']
})
export class RendimientoDePerforacionesComponent implements OnChanges {
  @Input() RendimientoPerforacion: any[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['RendimientoPerforacion'] && this.RendimientoPerforacion) {
      console.log('Datos recibidos:', this.RendimientoPerforacion);

      // 1. Cálculo de rendimiento: (ntaladro + ntaladros_rimados) * longitud_perforacion
      this.calcularRendimientoPerforacion();

      // 2. Cálculo de horas operativas
      this.calcularHorasOperativas();
    }
  }

  calcularRendimientoPerforacion(): void {
    const rendimientoPorCodigo: { [codigo: string]: number } = {};
  
    this.RendimientoPerforacion.forEach(item => {
      const totalTaladros = item.ntaladro + item.ntaladros_rimados;
      const rendimiento = totalTaladros * item.longitud_perforacion;
  
      if (!rendimientoPorCodigo[item.codigo]) {
        rendimientoPorCodigo[item.codigo] = 0;
      }
  
      rendimientoPorCodigo[item.codigo] += rendimiento;
    });
  
    const rendimientos = Object.entries(rendimientoPorCodigo).map(([codigo, total]) => ({
      codigo,
      rendimiento: total.toFixed(2)
    }));
  
    console.log('✅ Rendimiento de perforación AGRUPADO por código:', rendimientos);
  }
  

  calcularHorasOperativas(): void {
    const horasPorCodigo: Record<string, number> = {};
    const estadosProcesados = new Set<string>();  // Para evitar duplicados
  
    this.RendimientoPerforacion.forEach(item => {
      // Inicializa en 0 si es la primera vez que vemos este código
      if (!horasPorCodigo[item.codigo]) {
        horasPorCodigo[item.codigo] = 0;
      }
  
      // Filtramos solo los estados OPERATIVO válidos
      const estadosOperativos = (item.estados || []).filter(
        (estado: any) =>
          estado.estado === 'OPERATIVO' &&
          estado.hora_inicio &&
          estado.hora_final
      );
  
      estadosOperativos.forEach((estado: any) => {
        const key = `${item.codigo}_${estado.hora_inicio}_${estado.hora_final}`;
        if (!estadosProcesados.has(key)) {
          // Calcula la diferencia en bruto (puede tener muchos decimales)
          const diff = this.calcularDiferenciaHoras(estado.hora_inicio, estado.hora_final);
          horasPorCodigo[item.codigo] += diff;
          estadosProcesados.add(key);
        }
      });
    });
  
    // Preparamos el array de salida, SIN formatear los números
    const horasSinFormatear = Object.entries(horasPorCodigo).map(
      ([codigo, totalHoras]) => ({
        codigo,
        horas_operativas: totalHoras   // número crudo
      })
    );
  
    console.log('⏱️ Horas operativas por código (sin formatear):', horasSinFormatear);
  }
  

  // Convierte "HH:MM" a horas decimales (ej: "01:30" → 1.5)
  private calcularDiferenciaHoras(horaInicio: string, horaFinal: string): number {
    const [hIni, mIni] = horaInicio.split(':').map(Number);
    const [hFin, mFin] = horaFinal.split(':').map(Number);
  
    // Validación básica
    if (
      hIni < 0 || hIni >= 24 || mIni < 0 || mIni >= 60 ||
      hFin < 0 || hFin >= 24 || mFin < 0 || mFin >= 60
    ) {
      console.error('Formato de hora inválido');
      return 0;
    }
  
    const totalIni = hIni + mIni / 60;
    const totalFin = hFin + mFin / 60;
    // Maneja paso de medianoche
    return totalFin >= totalIni
      ? totalFin - totalIni
      : (totalFin + 24) - totalIni;
  }
  
}