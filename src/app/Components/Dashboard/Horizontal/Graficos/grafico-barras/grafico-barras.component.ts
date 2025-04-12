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
  selector: 'app-grafico-barras',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './grafico-barras.component.html',
  styleUrls: ['./grafico-barras.component.css']
})
export class GraficoBarrasComponent implements OnChanges {
  @Input() datos: any[] = [];
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: ChartOptions;

  constructor() {
    this.chartOptions = this.getDefaultOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datos']) {
      if (this.datos && this.datos.length > 0) {
        this.updateChart();
      } else {
        this.chartOptions = this.getDefaultOptions();
      }
    }
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
          endingShape: "rounded"
        } as any
      },
      dataLabels: {
        enabled: false
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
        title: {
          text: "Longitud de perforación por Equipo",
          style: {
            fontSize: '12px'
          }
        },
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
            return `${val} metros`;
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
      console.warn('No hay datos para mostrar');
      return;
    }
    
    const processedData = this.processData(this.datos);
    
    console.log('Datos finales para el gráfico:', processedData);
    
    this.chartOptions = {
      ...this.chartOptions,
      series: processedData.series,
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: processedData.categories,
        labels: {
          style: {
            fontSize: '12px',
            fontFamily: 'Arial'
          }
        }
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
  const equiposMap = new Map<string, number>();
  
  console.log('Datos brutos recibidos:', data);
  
  data.forEach(item => {
    const clave = `${item.equipo} (${item.codigo})`;
    const longitud = item.longitud_perforacion || 0; // Usamos la longitud directa
    
    // Acumular en el mapa
    const longitudActual = equiposMap.get(clave) || 0;
    equiposMap.set(clave, longitudActual + longitud);
    
    console.log(`Procesando: ${clave} - Longitud: ${longitud}m - Total acumulado: ${longitudActual + longitud}m`);
  });
  
  // Ordenar por nombre de equipo+código
  const equiposOrdenados = Array.from(equiposMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]));
  
  console.log('Datos procesados para el gráfico:', {
    series: equiposOrdenados.map(([_, longitud]) => longitud),
    categories: equiposOrdenados.map(([clave, _]) => clave)
  });
  
  return {
    series: [{
      name: "Longitud perforada",
      data: equiposOrdenados.map(([_, longitud]) => Number(longitud.toFixed(2)))
    }],
    categories: equiposOrdenados.map(([clave, _]) => clave)
  };
}

}