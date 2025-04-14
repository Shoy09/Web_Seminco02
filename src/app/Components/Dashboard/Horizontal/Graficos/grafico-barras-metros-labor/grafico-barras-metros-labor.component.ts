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
  selector: 'app-grafico-barras-metros-labor',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './grafico-barras-metros-labor.component.html',
  styleUrl: './grafico-barras-metros-labor.component.css'
})
export class GraficoBarrasMetrosLaborComponent implements OnChanges {
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
        stacked: false,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 5,
          endingShape: "rounded",
          dataLabels: {
            position: 'top' // Muestra las etiquetas encima de las barras
          }
        } as any
      },
      dataLabels: {
        enabled: true, // Habilita las etiquetas de datos
        formatter: (val: number) => {
          return val.toFixed(1); // Formatea a 1 decimal
        },
        style: {
          fontSize: '12px',
          colors: ['#000'] // Color del texto
        },
        offsetY: -20 // Ajusta la posición vertical
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      },
      xaxis: {
        categories: [],
        title: {
          text: 'Labores'
        },
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        // title: {
        //   text: "Longitud de perforación por Labor",
        //   style: {
        //     fontSize: '12px'
        //   }
        // },
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
    const laboresMap = new Map<string, number>();

    data.forEach(item => {
      const clave = `${item.tipo_labor}-${item.labor}`;
      const longitud = item.longitud_perforacion || 0;
  
      const longitudActual = laboresMap.get(clave) || 0;
      laboresMap.set(clave, longitudActual + longitud);
  
    });
  
    const laboresOrdenadas = Array.from(laboresMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));
  
  
    return {
      series: [{
        name: "Longitud perforada",
        data: laboresOrdenadas.map(([_, longitud]) => Number(longitud.toFixed(2)))
      }],
      categories: laboresOrdenadas.map(([clave, _]) => clave)
    };
  }
  

}