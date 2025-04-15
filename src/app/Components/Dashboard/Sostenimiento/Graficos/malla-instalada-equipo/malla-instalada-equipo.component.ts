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
  ApexTooltip
} from "ng-apexcharts";
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';

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
  selector: 'app-malla-instalada-equipo',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './malla-instalada-equipo.component.html',
  styleUrl: './malla-instalada-equipo.component.css'
})
export class MallaInstaladaEquipoComponent implements OnChanges {
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
          endingShape: "rounded",
          dataLabels: {
            position: 'top'
          }
        } as any
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => val.toFixed(1),
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
          text: 'Códigos'
        },
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        // title: {
        //   text: "Cantidad de mallas instaladas"
        // },
        labels: {
          formatter: (value: number) => value.toFixed(1)
        }
      },
      fill: {
        opacity: 1,
        colors: ['#10B981'] // color verde
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val} mallas`
        }
      },
      legend: {
        show: false
      }
    };
  }

  private updateChart(): void {
    const processedData = this.processData(this.datos);

    this.chartOptions = {
      ...this.chartOptions,
      series: processedData.series,
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: processedData.categories
      }
    };

    setTimeout(() => {
      if (this.chart && this.chart.updateSeries) {
        this.chart.updateSeries(processedData.series);
      }
    }, 100);
  }

  private processData(data: any[]): { series: any[], categories: string[] } {
    const codigosMap = new Map<string, number>();

    data.forEach(item => {
      const codigo = item.codigo;
      const malla = Number(item.malla_instalada) || 0;
      const valorActual = codigosMap.get(codigo) || 0;
      codigosMap.set(codigo, valorActual + malla);
    });

    const codigosOrdenados = Array.from(codigosMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));

    return {
      series: [{
        name: "Mallas Instaladas",
        data: codigosOrdenados.map(([_, total]) => Number(total.toFixed(2)))
      }],
      categories: codigosOrdenados.map(([codigo, _]) => codigo)
    };
  }
}
