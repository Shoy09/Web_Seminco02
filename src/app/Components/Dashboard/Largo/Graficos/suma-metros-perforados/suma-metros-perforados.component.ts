import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexChart,
  ApexFill,
  ChartComponent,
  ApexResponsive,
  ApexLegend,
  NgApexchartsModule
} from "ng-apexcharts";
import { CommonModule } from '@angular/common';
import { Meta } from '../../../../../models/meta.model';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  responsive: ApexResponsive[];
  legend: ApexLegend;
  colors: string[];
};

@Component({
  selector: 'app-suma-metros-perforados',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './suma-metros-perforados.component.html',
  styleUrl: './suma-metros-perforados.component.css'
})
export class SumaMetrosPerforadosComponent implements OnChanges {
  @Input() datos: any[] = [];
  @Input() metas: Meta[] = []; 
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  public sumaMetros: number = 0;
  public meta: number = 0;

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

  private getDefaultOptions(): Partial<ChartOptions> {
    return {
      series: [0],
      chart: {
        type: "radialBar",
        height: 350,
        offsetY: -20
      },
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          track: {
            background: "#e7e7e7",
            strokeWidth: "97%",
            margin: 5,
            dropShadow: {
              enabled: true,
              top: 2,
              left: 0,
              opacity: 0.31,
              blur: 2
            }
          },
          dataLabels: {
            name: {
              show: false
            },
            value: {
              offsetY: -2,
              fontSize: "22px",
              formatter: (val: number) => {
                return `${val.toFixed(2)}`;  // Aquí mostramos los metros perforados
              }
            }
          }
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          shadeIntensity: 0.4,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 50, 53, 91]
        }
      },
      labels: ["METROS PERFORADOS"],
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            height: 300
          }
        }
      }]
    };
  }

  private updateChart(): void {
    if (!this.datos || this.datos.length === 0) {
      console.warn('No hay datos para mostrar');
      return;
    }
    
    this.sumaMetros = this.calcularSumaMetros(); // Calcular la suma total de metros perforados

    this.meta = this.obtenerMeta(); // Asumimos que solo hay una meta

    // Aquí decidimos el color según si la meta ha sido superada o no
    if (this.sumaMetros >= this.meta) {
      this.chartOptions.colors = ['#00FF00'];  // Verde si se cumple la meta
    } else {
      this.chartOptions.colors = ['#FF0000'];  // Rojo si no se cumple
    }

    this.chartOptions = {
      ...this.chartOptions,
      series: [this.sumaMetros],
      labels: [`: ${this.sumaMetros.toFixed(2)} metros`]  // Mostramos los metros perforados en la etiqueta
    };

    requestAnimationFrame(() => {
  if (this.chart && this.chart.updateSeries) {
    this.chart.updateSeries([this.sumaMetros]);
  }
});

  }

  // Calcular la suma total de metros perforados
  private calcularSumaMetros(): number {
    let totalMetros = 0;

    this.datos.forEach(item => {
      const ntaladro = Number(item.ntaladro) || 0;
      const longitud = Number(item.longitud_perforacion) || 0;

      const resultado = ntaladro * longitud;
      totalMetros += resultado;
    });

    return totalMetros;
  }

  public obtenerMeta(): number {
    return this.metas.length > 0 ? this.metas[0].objetivo : 0;
  }
}
