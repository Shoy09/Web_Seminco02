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
  selector: 'app-grafico-barras-agrupada-num-labor',
  imports: [NgApexchartsModule],
  templateUrl: './grafico-barras-agrupada-num-labor.component.html',
  styleUrl: './grafico-barras-agrupada-num-labor.component.css'
})
export class GraficoBarrasAgrupadaNumLaborComponent implements OnChanges {
  @Input() datos: any[] = [];
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions> | any;

  ngOnChanges(changes: SimpleChanges): void {
    this.updateChart();
    if (this.datos && this.datos.length > 0) {
      this.updateChart();
    } else {
    }
  }

  private updateChart(): void {
    const processedData = this.processData(this.datos);
      
    this.chartOptions = {
      series: processedData.series,
      chart: {
        type: "bar",
        height: 350,
        stacked: false,
        toolbar: {
          show: true
        },
        zoom: {
          enabled: true
        }
      },
      // --- Agrega esta configuración ---
      legend: {
        show: true,          // Habilita las leyendas
        position: 'top',     // Posición: 'top', 'right', 'bottom', 'left'
        horizontalAlign: 'center', // Alineación horizontal
        markers: {
          width: 12,         // Ancho del icono de la leyenda
          height: 12         // Alto del icono de la leyenda
        }
      },
      // --------------------------------
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
        colors: ['transparent']
      },
      xaxis: {
        categories: processedData.categories,
        title: {
          text: 'Labores'
        }
      },
      yaxis: {
        // title: {
        //   text: 'Número de Taladros'
        // },
        min: 0
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function(val: number) {
            return val + " taladro";
          }
        }
      }
    };
  }

  private processData(data: any[]): { series: any[], categories: string[] } {
    // Objeto para acumular los valores por labor
    const acumulado: {[labor: string]: number} = {};
  
    // Sumar los valores para cada labor
    data.forEach(item => {
      const labor = `${item.tipo_labor}-${item.labor}`;;
      if (!acumulado[labor]) {
        acumulado[labor] = 0;
      }
      acumulado[labor] += item.ntaladro;
    });
  
    // Preparar los arrays finales
    const categories: string[] = [];
    const values: number[] = [];
  
    // Llenar los arrays ordenados alfabéticamente por labor
    Object.keys(acumulado).sort().forEach(labor => {
      categories.push(labor);
      values.push(acumulado[labor]);
    });
  
    return {
      series: [
        {
          name: 'Taladros',
          data: values
        }
      ],
      categories: categories
    };
  }
  

  constructor() {
    // Inicializar con datos vacíos
    this.chartOptions = {
      series: [],
      chart: {
        type: "bar",
        height: 350
      },
      xaxis: {
        categories: []
      }
    };
  }
}