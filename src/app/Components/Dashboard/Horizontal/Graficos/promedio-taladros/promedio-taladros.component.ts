import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-promedio-taladros',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './promedio-taladros.component.html',
  styleUrl: './promedio-taladros.component.css'
})
export class PromedioTaladrosComponent {
  @Input() datos: any[] = [];
  
  // Configuración del gráfico
  public chartOptions: any = {
    series: [],
    chart: {
      type: 'donut',
      height: 350
    },
    labels: [],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total promedio',
              formatter: () => {
                const total = this.chartOptions.series.reduce((a: number, b: number) => a + b, 0);
                const count = this.chartOptions.series.length;
                return (total / count).toFixed(1);
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val: number, opts: { w: { config: { labels: { [x: string]: string; }; }; }; seriesIndex: string | number; }) {
        return opts.w.config.labels[opts.seriesIndex] + ': ' + val.toFixed(1);
      }
    },
    legend: {
      position: 'right',
      horizontalAlign: 'center'
    },
    // title: {
    //   text: 'Distribución de Promedio de Taladros por Sección',
    //   align: 'center'
    // },
    colors: [
      '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0',
      '#546E7A', '#26a69a', '#D10CE8', '#FFA726', '#66BB6A'
    ]
  };

  ngOnInit(): void {
    this.prepareChartData();
  }

  ngOnChanges(): void {
    this.prepareChartData();
  }

  private prepareChartData(): void {
    if (!this.datos || this.datos.length === 0) {
      this.chartOptions.series = [];
      this.chartOptions.labels = [];
      return;
    }

    // Agrupar datos por sección
    const seccionesMap = new Map<string, { total: number, count: number }>();

    this.datos.forEach(item => {
      const seccion = item.seccion_la_labor;
      const totalTaladros = (item.ntaladro || 0) + (item.ntaladros_rimados || 0);
      
      if (seccionesMap.has(seccion)) {
        const current = seccionesMap.get(seccion)!;
        seccionesMap.set(seccion, {
          total: current.total + totalTaladros,
          count: current.count + 1
        });
      } else {
        seccionesMap.set(seccion, {
          total: totalTaladros,
          count: 1
        });
      }
    });

    // Preparar datos para el gráfico
    const labels: string[] = [];
    const series: number[] = [];

    seccionesMap.forEach((value, key) => {
      labels.push(key);
      series.push(value.total / value.count);
    });

    // Actualizar las opciones del gráfico
    this.chartOptions = {
      ...this.chartOptions,
      series: series,
      labels: labels
    };
  }
}