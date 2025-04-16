import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexStroke,
  ApexXAxis,
  ApexFill,
  ApexTooltip,
  NgApexchartsModule
} from "ng-apexcharts";
import { CommonModule } from '@angular/common';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
};

@Component({
  selector: 'app-rendimiento-de-perforaciones',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './rendimiento-de-perforaciones.component.html',
  styleUrls: ['./rendimiento-de-perforaciones.component.css']
})
export class RendimientoDePerforacionesComponent implements OnChanges {
  @Input() RendimientoPerforacion: any[] = [];
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: ChartOptions;

  // Datos calculados
  private rendimientos: {codigo: string, rendimiento: number}[] = [];
  private horasOperativas: {codigo: string, horas_operativas: number}[] = [];

  constructor() {
    this.chartOptions = this.getDefaultOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['RendimientoPerforacion'] && this.RendimientoPerforacion) {

      // 1. Cálculo de rendimiento
      this.rendimientos = this.calcularRendimientoPerforacion();
      
      // 2. Cálculo de horas operativas
      this.horasOperativas = this.calcularHorasOperativas();
      
      // 3. Calcular rendimiento por hora y actualizar gráfico
      this.actualizarGrafico();
    }
  }

  private calcularRendimientoPerforacion(): {codigo: string, rendimiento: number}[] {
    const rendimientoPorCodigo: { [codigo: string]: number } = {};
  
    this.RendimientoPerforacion.forEach(item => {
      if (!rendimientoPorCodigo[item.codigo]) {
        rendimientoPorCodigo[item.codigo] = 0;
      }
  
      item.perforaciones.forEach((perforacion: any) => {
        const rendimiento = (perforacion.ntaladro || 0) * (perforacion.longitud_perforacion || 0);
        rendimientoPorCodigo[item.codigo] += rendimiento;
      });
    });
  
    return Object.entries(rendimientoPorCodigo).map(([codigo, total]) => ({
      codigo,
      rendimiento: total
    }));
  }

  private calcularHorasOperativas(): {codigo: string, horas_operativas: number}[] {
    const horasPorCodigo: Record<string, number> = {};
    const estadosProcesados = new Set<string>();

    this.RendimientoPerforacion.forEach(item => {
      if (!horasPorCodigo[item.codigo]) {
        horasPorCodigo[item.codigo] = 0;
      }

      const estadosOperativos = (item.estados || []).filter(
        (estado: any) =>
          estado.estado === 'OPERATIVO' &&
          estado.hora_inicio &&
          estado.hora_final
      );

      estadosOperativos.forEach((estado: any) => {
        const key = `${item.codigo}_${estado.hora_inicio}_${estado.hora_final}`;
        if (!estadosProcesados.has(key)) {
          const diff = this.calcularDiferenciaHoras(estado.hora_inicio, estado.hora_final);
          horasPorCodigo[item.codigo] += diff;
          estadosProcesados.add(key);
        }
      });
    });

    return Object.entries(horasPorCodigo).map(
      ([codigo, totalHoras]) => ({
        codigo,
        horas_operativas: totalHoras
      })
    );
  }

  private actualizarGrafico(): void {
    // Combinar rendimientos y horas operativas por código
    const datosCombinados = this.combinarDatos();
    
    // Procesar datos para el gráfico
    const datosGrafico = this.procesarDatosParaGrafico(datosCombinados);
    
    // Actualizar opciones del gráfico
    this.chartOptions = {
      ...this.chartOptions,
      series: datosGrafico.series,
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: datosGrafico.categories
      },
      tooltip: {
        y: {
          formatter: (val: number) => {
            return `${val.toFixed(2)} m/h`; // Mostrar en metros por hora
          }
        }
      },
      yaxis: {
        ...this.chartOptions.yaxis,
        title: {
          text: "Rendimiento (m/h)",
          style: {
            fontSize: '12px'
          }
        }
      }
    };
  }

  private combinarDatos(): {codigo: string, rendimiento: number, horas_operativas: number}[] {
    const mapaCombinado = new Map<string, {rendimiento: number, horas_operativas: number}>();

    // Agregar rendimientos
    this.rendimientos.forEach(item => {
      mapaCombinado.set(item.codigo, {
        rendimiento: item.rendimiento,
        horas_operativas: 0 // Inicializar horas
      });
    });

    // Agregar horas operativas
    this.horasOperativas.forEach(item => {
      const existente = mapaCombinado.get(item.codigo);
      if (existente) {
        existente.horas_operativas = item.horas_operativas;
      }
    });

    // Convertir a array
    return Array.from(mapaCombinado.entries()).map(([codigo, datos]) => ({
      codigo,
      rendimiento: datos.rendimiento,
      horas_operativas: datos.horas_operativas
    }));
  }

  private procesarDatosParaGrafico(datos: any[]): { series: any[], categories: string[] } {
    // Ordenar por código
    const datosOrdenados = [...datos].sort((a, b) => a.codigo.localeCompare(b.codigo));

    return {
      series: [{
        name: "Rendimiento por hora",
        data: datosOrdenados.map(item => {
          // Calcular rendimiento por hora (evitar división por cero)
          const horas = item.horas_operativas || 1; // Si horas es 0, usamos 1 para evitar NaN
          return (item.rendimiento / horas);
        })
      }],
      categories: datosOrdenados.map(item => item.codigo)
    };
  }

  private calcularDiferenciaHoras(horaInicio: string, horaFinal: string): number {
    const [hIni, mIni] = horaInicio.split(':').map(Number);
    const [hFin, mFin] = horaFinal.split(':').map(Number);

    if (
      hIni < 0 || hIni >= 24 || mIni < 0 || mIni >= 60 ||
      hFin < 0 || hFin >= 24 || mFin < 0 || mFin >= 60
    ) {
      console.error('Formato de hora inválido');
      return 0;
    }

    const totalIni = hIni + mIni / 60;
    const totalFin = hFin + mFin / 60;
    return totalFin >= totalIni
      ? totalFin - totalIni
      : (totalFin + 24) - totalIni;
  }

  private getDefaultOptions(): ChartOptions {
    return {
      series: [],
      chart: {
        type: "bar",
        height: 350,
        stacked: false,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 5,
          endingShape: "rounded",
          dataLabels: {
            position: 'top'
          }
        } as any
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => {
          return val.toFixed(1);
        },
        style: {
          fontSize: '12px',
          colors: ['#000']
        },
        offsetY: -20
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      },
      xaxis: {
        categories: [],
        title: {
          text: 'Equipos'
        },
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        labels: {
          formatter: (value: number) => {
            return value.toFixed(1);
          }
        }
      },
      fill: {
        opacity: 1,
        colors: ['#3B82F6']
      },
      tooltip: {
        y: {
          formatter: (val: number) => {
            return `${val.toFixed(2)} m/h`;
          }
        }
      },
      legend: {
        show: false
      }
    };
  }
}