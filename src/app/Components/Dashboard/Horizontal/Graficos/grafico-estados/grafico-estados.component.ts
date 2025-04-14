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
              enabled: true,  // Activar solo los totales
              style: {
                fontSize: '13px',
                fontWeight: 900
              },
              formatter: (val: number) => {
                const horas = Math.floor(val);
                const minutos = Math.round((val - horas) * 60);
                return `${horas}h ${minutos}m`;  // Formatear las horas totales
              }
            }
          }
        }
      } as any,
      dataLabels: {
        enabled: false  // Desactivar dataLabels dentro de las barras
      },
      stroke: {
        show: true,
        width: 1,
        colors: ["#fff"]
      },
      xaxis: {
        labels: {
          formatter: (value: string) => {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) return value;
            const horas = Math.floor(numValue);
            const minutos = Math.round((numValue - horas) * 60);
            return `${horas}h ${minutos}m`;
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
            const horas = Math.floor(val);
            const minutos = Math.round((val - horas) * 60);
            return `${horas}h ${minutos}m`;  // Formatear el tooltip también
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
    // Calcular duración
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
  
    // Obtener operaciones y estados únicos
    const operacionesUnicas = Array.from(new Set(datosConDuracion.map(item => item.codigoOperacion)));
    const estadosUnicos = Array.from(new Set(datosConDuracion.map(item => item.estado)));
  
    // Inicializar series por estado
    const series = estadosUnicos.map(estado => {
      const data = operacionesUnicas.map(operacion => {
        const items = datosConDuracion.filter(item =>
          item.codigoOperacion === operacion && item.estado === estado
        );
        const duracionTotal = items.reduce((sum, item) => sum + item.duracion, 0);
        return parseFloat(duracionTotal.toFixed(2));
      });
  
      return {
        name: estado,
        data: data
      };
    });
  
    return {
      series: series,
      categories: operacionesUnicas
    };
  }
  

  private parseHora(horaString: string): Date {
    const [horas, minutos] = horaString.split(':').map(Number);
    const date = new Date();
    date.setHours(horas, minutos, 0, 0);
    return date;
  }
}