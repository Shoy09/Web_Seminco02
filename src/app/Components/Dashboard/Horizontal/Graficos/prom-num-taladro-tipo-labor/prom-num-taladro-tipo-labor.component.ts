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
      formatter: function (val: number) {
        return val.toFixed(1);
      },
      style: {
        fontSize: '12px',
        colors: ['#000']
      },
      offsetX: 0
    },
    colors: ['#3B82F6'],
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
        formatter: function (val: number) {
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

    // Agrupar datos por tipo de labor y labor específica
    const laborMap = new Map<string, Map<string, { total: number, count: number }>>();

    this.datos.forEach(item => {
      const tipoLabor = item.tipo_labor;
      const labor = item.labor || "Sin labor";  // Asegurarse de que cada labor esté correctamente identificada
      const totalTaladros = (item.ntaladro || 0) + (item.ntaladros_rimados || 0);

      // Si no existe el tipo de labor en el mapa, crearlo
      if (!laborMap.has(tipoLabor)) {
        laborMap.set(tipoLabor, new Map<string, { total: number, count: number }>());
      }

      const laborMapInner = laborMap.get(tipoLabor)!;

      // Si no existe la labor dentro del tipo de labor, crearla
      if (!laborMapInner.has(labor)) {
        laborMapInner.set(labor, { total: 0, count: 0 });
      }

      const current = laborMapInner.get(labor)!;
      laborMapInner.set(labor, {
        total: current.total + totalTaladros,
        count: current.count + 1
      });
    });

    // Ordenar por promedio (de mayor a menor)
    const categorias: string[] = [];
    const promedios: number[] = [];

    laborMap.forEach((laborInnerMap, tipoLabor) => {
      laborInnerMap.forEach((value, labor) => {
        categorias.push(`${tipoLabor} - ${labor}`);
        promedios.push(value.total / value.count);
      });
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
