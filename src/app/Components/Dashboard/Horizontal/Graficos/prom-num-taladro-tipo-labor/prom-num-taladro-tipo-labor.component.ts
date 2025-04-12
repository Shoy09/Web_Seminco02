import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-prom-num-taladro-tipo-labor',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './prom-num-taladro-tipo-labor.component.html',
  styleUrls: ['./prom-num-taladro-tipo-labor.component.css']
})
export class PromNumTaladroTipoLaborComponent implements OnInit {
  @Input() datos: any[] = [];
  
  // Configuración del gráfico de barras horizontales
  public chartOptions: any = {
    series: [],
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val: number) {
        return val.toFixed(1);
      },
      style: {
        fontSize: '12px',
        colors: ['#000']
      },
      offsetX: 0
    },
    // title: {
    //   text: 'Promedio de Taladros por Tipo de Labor',
    //   align: 'center'
    // },
    colors: ['#3f51b5'],
    xaxis: {
      categories: [],
      title: {
        text: 'Promedio de taladros',
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Tipo de labor',
        style: {
          fontSize: '12px'
        }
      },
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    tooltip: {
      y: {
        formatter: function(val: number) {
          return 'Promedio: ' + val.toFixed(1);
        }
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

    // Agrupar datos por tipo de labor
    const laborMap = new Map<string, { total: number, count: number }>();

    this.datos.forEach(item => {
      const tipoLabor = item.tipo_labor;
      const totalTaladros = (item.ntaladro || 0) + (item.ntaladros_rimados || 0);
      
      if (laborMap.has(tipoLabor)) {
        const current = laborMap.get(tipoLabor)!;
        laborMap.set(tipoLabor, {
          total: current.total + totalTaladros,
          count: current.count + 1
        });
      } else {
        laborMap.set(tipoLabor, {
          total: totalTaladros,
          count: 1
        });
      }
    });

    // Ordenar por promedio (de mayor a menor)
    const sortedEntries = Array.from(laborMap.entries()).sort((a, b) => {
      return (b[1].total / b[1].count) - (a[1].total / a[1].count);
    });

    // Preparar datos para el gráfico
    const categorias: string[] = [];
    const promedios: number[] = [];

    sortedEntries.forEach(([key, value]) => {
      categorias.push(key);
      promedios.push(value.total / value.count);
    });

    // Actualizar las opciones del gráfico
    this.chartOptions = {
      ...this.chartOptions,
      series: [{
        name: 'Promedio de taladros',
        data: promedios
      }],
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: categorias
      }
    };
  }
}