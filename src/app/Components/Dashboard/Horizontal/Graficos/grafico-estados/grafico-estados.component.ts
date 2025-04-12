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
  selector: 'app-grafico-estados',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './grafico-estados.component.html',
  styleUrls: ['./grafico-estados.component.css']
})
export class GraficoEstadosComponent implements OnChanges {
  @Input() datos: any[] = [];
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: ChartOptions;

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
      chart: {
        type: "bar",
        height: 350,
        stacked: true,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 5,
          endingShape: "rounded",
          dataLabels: {
            total: {
              enabled: true,
              style: {
                fontSize: '13px',
                fontWeight: 900
              }
            }
          }
        } as any
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
        categories: [],
        title: {
          text: 'Horas'
        },
        labels: {
          formatter: (value: string) => {  // Cambiado a recibir string
            const numValue = parseFloat(value);
            return !isNaN(numValue) ? numValue.toFixed(2) + 'h' : value;
          }
        }
      },
      yaxis: {
        title: {
          text: "Estados",
          style: {
            fontSize: '12px'
          }
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: (val: number) => {
            return `${val.toFixed(2)} horas`;
          }
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'center'
      }
    };
  }

  private updateChart(): void {
    if (!this.datos || this.datos.length === 0) {
      console.warn('No hay datos para mostrar');
      return;
    }
    
    const processedData = this.processData(this.datos);
    
    this.chartOptions = {
      ...this.chartOptions,
      series: processedData.series,
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: processedData.categories
      }
    };
    
    // Forzar actualización si es necesario
    setTimeout(() => {
      if (this.chart && this.chart.updateSeries) {
        this.chart.updateSeries(processedData.series);
      }
    }, 100);
  }

  private processData(data: any[]): { series: any[], categories: string[] } {
    // Calcular duración en horas para cada registro
    const datosConDuracion = data.map(item => {
      const inicio = this.parseHora(item.hora_inicio).getTime();
      const fin = this.parseHora(item.hora_final).getTime();
      let duracionHoras = (fin - inicio) / (1000 * 60 * 60);
      
      // Manejar casos donde la hora final es del día siguiente (ej. 23:00 a 01:00)
      if (duracionHoras < 0) {
        duracionHoras += 24;
      }
      
      const itemConDuracion = {
        ...item,
        duracion: duracionHoras > 0 ? duracionHoras : 0
      };
      
      // Ver los datos con duración calculada
      console.log('Datos con duración:', itemConDuracion);
  
      return itemConDuracion;
    });
  
    // Agrupar por estado y turno
    const estadosTurnosMap = new Map<string, Map<string, number>>();
    const estadosUnicos = Array.from(new Set(data.map(item => item.estado)));
    const turnosUnicos = Array.from(new Set(data.map(item => item.turno)));
  
    // Inicializar estructura de datos
    estadosUnicos.forEach(estado => {
      estadosTurnosMap.set(estado, new Map<string, number>());
      turnosUnicos.forEach(turno => {
        estadosTurnosMap.get(estado)?.set(turno, 0);
      });
    });
  
    // Acumular duraciones
    datosConDuracion.forEach(item => {
      const estadoMap = estadosTurnosMap.get(item.estado);
      if (estadoMap) {
        const duracionActual = estadoMap.get(item.turno) || 0;
        estadoMap.set(item.turno, duracionActual + item.duracion);
      }
    });
  
    // Ver el estado de la acumulación de duraciones
    console.log('Estados y turnos acumulados:', estadosTurnosMap);
  
    // Preparar series (una por turno)
    const series = turnosUnicos.map(turno => {
      const turnoData = {
        name: turno,
        data: estadosUnicos.map(estado => {
          const value = estadosTurnosMap.get(estado)?.get(turno) || 0;
          const valueFixed = parseFloat(value.toFixed(2));  // Redondear a 2 decimales
          // Ver los valores de cada serie
          console.log(`Valor para turno ${turno} y estado ${estado}:`, valueFixed);
          return valueFixed;
        })
      };
  
      // Ver los datos de cada serie
      console.log('Serie para turno', turno, turnoData);
      return turnoData;
    });
  
    // Ver las categorías y las series finalizadas
    console.log('Categorías:', estadosUnicos);
    console.log('Series finalizadas:', series);
  
    return {
      series: series,
      categories: estadosUnicos
    };
  }
  

  private parseHora(horaString: string): Date {
    const [horas, minutos] = horaString.split(':').map(Number);
    const date = new Date();
    date.setHours(horas, minutos, 0, 0);
    return date;
  }
}