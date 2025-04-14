import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-prom-metros-perforados-seccion',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './prom-metros-perforados-seccion.component.html',
  styleUrls: ['./prom-metros-perforados-seccion.component.css']
})
export class PromMetrosPerforadosSeccionComponent implements OnInit {
  @Input() datos: any[] = [];
  
  // Configuración del gráfico de líneas con área
  public chartOptions: any = {
    series: [],
    chart: {
      type: 'area',
      height: 350,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val: number) {
        return val.toFixed(1) + ' m';
      },
      style: {
        fontSize: '12px',
        colors: ['#000']
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    // title: {
    //   text: 'Promedio de Metros Perforados por Sección',
    //   align: 'center',
    //   style: {
    //     fontSize: '16px'
    //   }
    // },
    colors: ['#00E396'], // Verde para representar metros
    xaxis: {
      categories: [],
      title: {
        text: 'Sección de la labor',
        style: {
          fontSize: '12px'
        }
      },
      labels: {
        style: {
          fontSize: '12px'
        },
        rotate: -45 // Rotar etiquetas si son largas
      }
    },
    yaxis: {
      // title: {
      //   text: 'Metros (promedio)',
      //   style: {
      //     fontSize: '12px'
      //   }
      // },
      labels: {
        formatter: function(val: number) {
          return val.toFixed(1) + ' m';
        }
      },
      min: 0
    },
    tooltip: {
      y: {
        formatter: function(val: number) {
          return val.toFixed(2) + ' metros';
        }
      }
    },
    markers: {
      size: 5,
      hover: {
        size: 7
      }
    }
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
      this.chartOptions.xaxis.categories = [];
      return;
    }
  
    // Agrupar datos por sección con nueva lógica de cálculo
    const seccionMap = new Map<string, { total: number, count: number }>();
  
    this.datos.forEach(item => {
      const seccion = item.seccion_la_labor;
      const longitud = parseFloat(item.longitud_perforacion) || 0;
      const ntaladro = parseInt(item.ntaladro) || 0;
      const rimados = parseInt(item.ntaladros_rimados) || 0;
  
      const metrosPerforados = (ntaladro + rimados) * longitud;
  
      if (seccionMap.has(seccion)) {
        const current = seccionMap.get(seccion)!;
        seccionMap.set(seccion, {
          total: current.total + metrosPerforados,
          count: current.count + 1
        });
      } else {
        seccionMap.set(seccion, {
          total: metrosPerforados,
          count: 1
        });
      }
    });
  
    // Ordenar alfabéticamente por sección
    const sortedEntries = Array.from(seccionMap.entries()).sort((a, b) => {
      return a[0].localeCompare(b[0]);
    });
  
    // Preparar datos para el gráfico
    const categorias: string[] = [];
    const promedios: number[] = [];
  
    sortedEntries.forEach(([key, value]) => {
      categorias.push(key);
      promedios.push(value.total / value.count); // Promedio por sección
    });
  
    // Actualizar opciones del gráfico
    this.chartOptions = {
      ...this.chartOptions,
      series: [{
        name: 'Metros perforados',
        data: promedios
      }],
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: categorias
      }
    };
  }  
} 