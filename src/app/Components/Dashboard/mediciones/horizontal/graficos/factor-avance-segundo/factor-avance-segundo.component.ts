import { CommonModule } from "@angular/common";
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core";
import { NgApexchartsModule, ChartComponent, ApexChart, ApexDataLabels, ApexPlotOptions, ApexYAxis, ApexXAxis, ApexFill, ApexTooltip, ApexStroke, ApexLegend } from "ng-apexcharts";
import { MedicionesHorizontal } from "../../../../../../models/MedicionesHorizontal";
import { Tonelada } from "../../../../../../models/tonelada";

export type ExtendedSeries = {
  name?: string;
  type?: "line" | "bar" | "area";
  data: (number | null)[];
  yAxisIndex?: number; // 👈 añadido
};

export type ChartOptions = {
  series: ExtendedSeries[];
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis | ApexYAxis[];
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  colors?: string[];
};

@Component({
  selector: 'app-factor-avance-segundo',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './factor-avance-segundo.component.html',
  styleUrl: './factor-avance-segundo.component.css'
})
export class FactorAvanceSegundoComponent implements OnChanges {
  @Input() datos: MedicionesHorizontal[] = [];
  @Input() toneladas: Tonelada[] = [];
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: ChartOptions;

  constructor() {
    this.chartOptions = this.getDefaultOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datos'] && this.datos) {
      console.log('📊 Datos recibidos en FactorAvanceComponent:', this.datos);
      this.updateChart();
    }
  }

  private getDefaultOptions(): ChartOptions {
    return {
      series: [],
      chart: {
        type: "bar",
        height: 400,
        stacked: false,
        toolbar: { show: true },
        zoom: { enabled: true },
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
        enabledOnSeries: [0], // solo en barras
        formatter: (val: number) => val ? val.toFixed(2) : '',
        style: {
          fontSize: '12px',
          colors: ['#000']
        },
        offsetY: -20
      },
      stroke: {
        width: [0, 4],
        colors: [undefined, '#BF4342'],
        curve: 'smooth',
        dashArray: [0, 10]
      },
      colors: ['#3B82F6', '#FF9800'],
      fill: { opacity: 1 },
      xaxis: {
        categories: [],
        title: { text: 'Labores' },
        labels: {
          rotate: -45,
          style: { fontSize: '10px' }
        }
      },
      yaxis: [
  {
    seriesName: "Rendimiento (Kg/m) / Toneladas",
    title: { text: "Rendimiento (Kg/m) / Toneladas" },
    labels: {
      formatter: (val: number) => val.toFixed(2)
    }
  },
  {
    opposite: true,
    seriesName: "Rendimiento/Toneladas",
    title: { text: "Rendimiento/Toneladas" },
    labels: {
      formatter: (val: number) => val.toFixed(2)
    }
  }
],


      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => val ? val.toFixed(2) : ''
        }
      },
      legend: {
        show: true,
        position: 'top',
        markers: {
          fillColors: ['#3B82F6', '#FF9800']
        }
      }
    };
  }

private updateChart(): void {
  const filtrados = this.datos.filter(d =>
    d.kg_explosivos && d.avance_programado &&
    (!d.no_aplica || d.no_aplica === 0) &&
    (!d.remanente || d.remanente === 0)
  );

  if (filtrados.length === 0) {
    this.chartOptions.series = [];
    return;
  }

  const categories = filtrados.map(d => d.labor || '');
  const rendimiento = filtrados.map(d =>
    d.avance_programado! > 0 ? (d.kg_explosivos! / d.avance_programado!) : 0
  );
  const avance = filtrados.map(d => d.avance_programado!);

  // 🔹 Cálculo de promedios
  const totalKg = filtrados.reduce((sum, d) => sum + (d.kg_explosivos || 0), 0);
  const totalAvance = filtrados.reduce((sum, d) => sum + (d.avance_programado || 0), 0);

  const promedioRendimiento = totalAvance > 0 ? (totalKg / totalAvance) : 0;
  const promedioAvance = filtrados.length > 0 ? (totalAvance / filtrados.length) : 0;

  // Agregar categoría PROMEDIO
  categories.push('PROMEDIO');
  rendimiento.push(promedioRendimiento);
  avance.push(promedioAvance); // 👈 ahora sí se dibuja en el promedio

  this.chartOptions = {
    ...this.chartOptions,
    series: [
      {
        name: "Rendimiento (Kg/m)",
        type: "bar",
        data: rendimiento
      },
      {
        name: "Avance Programado (m)",
        type: "line",
        data: avance
      }
    ],
    xaxis: {
      ...this.chartOptions.xaxis,
      categories
    }
  };

  setTimeout(() => {
    if (this.chart && this.chart.updateOptions) {
      this.chart.updateOptions(this.chartOptions);
    }
  }, 100);
}

}
