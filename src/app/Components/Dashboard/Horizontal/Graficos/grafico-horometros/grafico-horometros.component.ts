import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-grafico-horometros',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './grafico-horometros.component.html',
  styleUrls: ['./grafico-horometros.component.css']
})
export class GraficoHorometrosComponent implements OnInit {
  @Input() datosHorometros: any[] = [];
  public totalesHorometros: {nombre: string, total: number}[] = [];
  
  public chartOptions: any = {
    series: [],
    chart: {
      type: 'bar',
      height: 350,
      stacked: true,
      toolbar: {
        show: false
      },
      events: {
        mounted: (chartContext: any, config: any) => {
          // Este evento se dispara cuando el gráfico se monta
        }
      }
    },
    plotOptions: { 
      bar: {
        horizontal: false,
        borderRadius: 5,
        endingShape: "rounded",
        
      }
    } as any,
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val > 0 ? val.toFixed(1) : '',
      style: {
        fontSize: '10px', // Tamaño de letra más pequeño
        colors: ['#000']
      },
      offsetY: 0,
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        opacity: 0.7
      }
    },
    colors: [],
    xaxis: {
      categories: [],
      title: {
        text: 'Códigos de Equipo',
        style: {
          fontSize: '10px' // Tamaño de letra más pequeño
        }
      },
      labels: {
        style: {
          fontSize: '10px' // Tamaño de letra más pequeño
        }
      }
    },
    yaxis: {
      // title: {
      //   text: 'Horas Totales',
      //   style: {
      //     fontSize: '10px' // Tamaño de letra más pequeño
      //   }
      // },
      labels: {
        style: {
          fontSize: '10px' // Tamaño de letra más pequeño
        },
        formatter: (val: number) => val.toFixed(1)
      },
      min: 0
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toFixed(2)}`
      },
      style: {
        fontSize: '10px' // Tamaño de letra más pequeño en tooltips
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      fontSize: '10px', // Tamaño de letra más pequeño
      itemMargin: {
        horizontal: 5,
        vertical: 2
      }
    },
    // title: {
    //   text: 'Resumen de Horómetros',
    //   align: 'center',
    //   style: {
    //     fontSize: '12px' // Título un poco más grande pero discreto
    //   }
    // }
  };

  ngOnInit(): void {
    this.actualizarGrafico();
  }

  ngOnChanges(): void {
    this.actualizarGrafico();
  }

  private actualizarGrafico(): void {
    if (!this.datosHorometros || this.datosHorometros.length === 0) {
      this.chartOptions.series = [];
      this.chartOptions.xaxis.categories = [];
      this.totalesHorometros = [];
      return;
    }

    // Agrupar datos por código y horómetro
    const codigosMap = new Map<string, Map<string, number>>();
    const horometrosSet = new Set<string>();
    const totalesMap = new Map<string, number>(); // Para calcular los totales por horómetro

    this.datosHorometros.forEach(item => {
      const codigo = item.codigo;
      const horometro = item.nombreHorometro;
      const diferencia = item.diferencia;

      // Acumular total por horómetro
      const totalActual = totalesMap.get(horometro) || 0;
      totalesMap.set(horometro, totalActual + diferencia);

      // Agregar horómetro al conjunto
      horometrosSet.add(horometro);

      if (!codigosMap.has(codigo)) {
        codigosMap.set(codigo, new Map<string, number>());
      }

      const horometrosDelCodigo = codigosMap.get(codigo)!;
      const acumulado = horometrosDelCodigo.get(horometro) || 0;
      horometrosDelCodigo.set(horometro, acumulado + diferencia);
    });

    // Preparar los totales para mostrar arriba del gráfico
    this.totalesHorometros = Array.from(totalesMap.entries()).map(([nombre, total]) => ({
      nombre,
      total: parseFloat(total.toFixed(2))
    }));

    // Ordenar los horómetros por nombre para consistencia
    const horometros = Array.from(horometrosSet).sort();
    const codigos = Array.from(codigosMap.keys()).sort();

    // Crear series para cada horómetro
    const series = horometros.map(horometro => {
      const data = codigos.map(codigo => {
        const horometrosDelCodigo = codigosMap.get(codigo)!;
        return horometrosDelCodigo.get(horometro) || 0;
      });

      return {
        name: horometro,
        data: data
      };
    });

    // Actualizar opciones del gráfico
    this.chartOptions = {
      ...this.chartOptions,
      series: series,
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: codigos
      }
    };
  }
}