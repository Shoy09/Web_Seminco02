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
  colors: string[];
};

@Component({
  selector: 'app-promedio-de-estados-general',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './promedio-de-estados-general.component.html',
  styleUrl: './promedio-de-estados-general.component.css'
})
export class PromedioDeEstadosGeneralComponent implements OnChanges {
  @Input() datos: any[] = [];
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: ChartOptions;

  // Mapeo de estados a colores (asegúrate que coincida exactamente con los valores de tus datos)
  private coloresPorEstado: { [key: string]: string } = {
    'OPERATIVO': '#4CAF50',        // Verde
    'DEMORA': '#FFEB3B',           // Amarillo
    'MANTENIMIENTO': '#F44336',    // Rojo
    'RESERVA': '#FF9800',          // Naranja
    'FUERA DE PLAN': '#2196F3',    // Azul
  };  

  constructor() {
    this.chartOptions = this.getDefaultOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datos'] && this.datos && this.datos.length > 0) {
      this.updateChart();
    } else {
      this.chartOptions = this.getDefaultOptions();
    }
  }

  private getDefaultOptions(): ChartOptions {
    return {
      series: [],
      colors: [],
      chart: {
        type: "bar",
        height: 350,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 5,
          distributed: true,
          dataLabels: {
            total: {
              enabled: true,
              style: {
                fontSize: '10px',
                fontWeight: 900 
              },
              formatter: (val: string) => { // Cambiado a string
                const numValue = parseFloat(val);
                if (isNaN(numValue)) return val;
                const horas = Math.floor(numValue);
                const minutos = Math.round((numValue - horas) * 60);
                return `${horas}h ${minutos}m`;
              }
            }
          }
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 1,
        colors: ["#fff"]
      },
      xaxis: {
        type: 'category',
        labels: {
          formatter: (value: string) => { // Eje X usa string
            return value; // Mostramos el nombre del estado directamente
          }
        }
      },
      yaxis: {
        labels: {
          formatter: (val: number) => { // Eje Y puede usar number
            const horas = Math.floor(val);
            const minutos = Math.round((val - horas) * 60);
            return `${horas}h ${minutos}m`;
          }
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: (val: number) => { // Tooltip usa number
            const horas = Math.floor(val);
            const minutos = Math.round((val - horas) * 60);
            return `${horas}h ${minutos}m`;
          }
        }
      },
      legend: {
        show: false
      }
    };
  }

  private updateChart(): void {
    if (!this.datos || this.datos.length === 0) {
      return;
    }
    
    const processedData = this.processData(this.datos);
    
    this.chartOptions = {
      ...this.chartOptions,
      series: [{
        name: "Horas",
        data: processedData.dataPoints.map(point => ({
          x: point.x,
          y: point.y,
          fillColor: point.fillColor
        }))
      }],
      colors: processedData.colors,
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: processedData.categories
      }
    };
    
    setTimeout(() => {
      if (this.chart && this.chart.updateOptions) {
        this.chart.updateOptions(this.chartOptions);
      }
    }, 100);
  }

  private processData(data: any[]): { dataPoints: any[], categories: string[], colors: string[] } {
    // Procesar duraciones
    const datosConDuracion = data.map(item => {
      const inicio = this.parseHora(item.hora_inicio).getTime();
      const fin = this.parseHora(item.hora_final).getTime();
      let duracionHoras = (fin - inicio) / (1000 * 60 * 60);
      if (duracionHoras < 0) duracionHoras += 24;
      return {
        ...item,
        duracion: duracionHoras > 0 ? duracionHoras : 0
      };
    });
  
    // Calcular sumas por estado y códigos únicos
    const sumasPorEstado: { [estado: string]: number } = {};
    const codigosUnicos = new Set<string>();
  
    datosConDuracion.forEach(item => {
      const estado = item.estado.toUpperCase();
      codigosUnicos.add(item.codigoOperacion);// Asume que existe item.codigo
      
      sumasPorEstado[estado] = (sumasPorEstado[estado] || 0) + item.duracion;
    });
  
    const totalCodigos = codigosUnicos.size;

    // Preparar datos para el gráfico
    const estados = Object.keys(sumasPorEstado);
    const dataPoints = estados.map(estado => {
      const promedio = totalCodigos > 0 ? sumasPorEstado[estado] / totalCodigos : 0;
            
      return {
        x: estado,
        y: parseFloat(promedio.toFixed(2)),
        fillColor: this.coloresPorEstado[estado] || '#000000'
      };
    });
  
    return {
      dataPoints: dataPoints,
      categories: estados,
      colors: estados.map(estado => this.coloresPorEstado[estado] || '#000000')
    };
  }

  private parseHora(horaString: string): Date {
    const [horas, minutos] = horaString.split(':').map(Number);
    const date = new Date();
    date.setHours(horas, minutos, 0, 0);
    return date;
  }
}