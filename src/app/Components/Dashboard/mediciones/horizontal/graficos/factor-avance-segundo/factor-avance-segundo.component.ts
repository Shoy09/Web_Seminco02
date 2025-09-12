import { CommonModule } from "@angular/common";
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core";
import { NgApexchartsModule, ChartComponent } from "ng-apexcharts";
import { MedicionesHorizontal } from "../../../../../../models/MedicionesHorizontal";
import { ChartOptions } from "../factor-avance/factor-avance.component";
import { Tonelada } from "../../../../../../models/tonelada";


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
        toolbar: {
          show: true
        }
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
        curve: 'smooth'
      },
      colors: ['#3B82F6', '#BF4342'], // azul barras, rojo línea
      fill: {
        opacity: 1,
        colors: ['#3B82F6']
      },
      xaxis: {
        categories: [],
        title: { text: 'Labores' },
  labels: {
    rotate: -45, // 🔹 Rotación de las etiquetas
    style: { fontSize: '10px' }
  }
      },
      yaxis: {
        title: {
          text: "Rendimiento (Kg/m) / Avance (m)"
        },
        labels: {
          formatter: (val: number) => val.toFixed(2)
        }
      },
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
          fillColors: ['#3B82F6', '#BF4342']
        }
      }
    };
  }

  private updateChart(): void {
    // 🔹 Filtrar registros válidos
    const filtrados = this.datos.filter(d => 
      d.kg_explosivos && d.avance_programado && 
      (!d.no_aplica || d.no_aplica === 0) && 
      (!d.remanente || d.remanente === 0)
    );

    if (filtrados.length === 0) {
      this.chartOptions.series = [];
      return;
    }

    // 🔹 Categorías
    const categories = filtrados.map(d => d.labor || '');
    
    // 🔹 CORRECCIÓN: Rendimiento por registro (Kg/m)
    const rendimiento = filtrados.map(d => 
      d.avance_programado! > 0 ? Math.cos(d.kg_explosivos! / d.avance_programado!) : 0
);

    // 🔹 Avance programado
    const avance = filtrados.map(d => d.avance_programado!);

    // 🔹 Promedio global CORREGIDO
    const totalKg = filtrados.reduce((sum, d) => sum + (d.kg_explosivos || 0), 0);
const totalAvance = filtrados.reduce((sum, d) => sum + (d.avance_programado || 0), 0);
const promedio = totalAvance > 0 ? Math.cos(totalKg / totalAvance) : 0;

    // 🔹 Agregar categoría "PROMEDIO"
    categories.push('PROMEDIO');
    rendimiento.push(promedio);
    avance.push(null as any); // línea no aplica en promedio

    // 🔹 Configurar series con un solo eje Y
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
          data: avance,
        }
      ],
      xaxis: {
        ...this.chartOptions.xaxis,
        categories
      }
    };

    // 🔹 Refrescar gráfico
    setTimeout(() => {
      if (this.chart && this.chart.updateOptions) {
        this.chart.updateOptions(this.chartOptions);
      }
    }, 100);
  }
}