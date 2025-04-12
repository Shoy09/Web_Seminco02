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
        horizontal: false,
        columnWidth: '70%',
        endingShape: 'rounded',
        borderRadius: 4,
        dataLabels: {
          position: 'top'
        }
      }
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

    colors: ['#3f51b5', '#ff9800', '#4caf50', '#e91e63', '#00bcd4'],
    xaxis: {
      categories: [],
      title: {
        text: 'Horómetros',
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
    yaxis: {
      title: {
        text: 'Diferencia (Final - Inicial)',
        style: {
          fontSize: '12px'
        }
      },
      labels: {
        formatter: (val: number) => val.toFixed(1)
      },
      min: 0
    },
    tooltip: {
      y: {
        formatter: (val: number) => val.toFixed(2)
      }
    }
  };

  ngOnInit(): void {
    console.log('ngOnInit - Datos iniciales recibidos:', this.datosHorometros);
    this.actualizarGrafico();
  }

  ngOnChanges(): void {
    console.log('ngOnChanges - Datos actualizados recibidos:', this.datosHorometros);
    this.actualizarGrafico();
  }

  private actualizarGrafico(): void {
    console.group('Iniciando actualización de gráfico');
    
    if (!this.datosHorometros || this.datosHorometros.length === 0) {
      this.chartOptions.series = [];
      this.chartOptions.xaxis.categories = [];
      return;
    }
  
  
    // Agrupar datos por nombre de horómetro (suma total)
    const horometrosMap = new Map<string, number>();
  
    this.datosHorometros.forEach((item, index) => {
      const nombre = item.nombreHorometro;
      const diferencia = item.final - item.inicial;
      
  
      if (horometrosMap.has(nombre)) {
        const acumulado = horometrosMap.get(nombre)!;
        const nuevoAcumulado = acumulado + diferencia;
        horometrosMap.set(nombre, nuevoAcumulado);
      } else {
        horometrosMap.set(nombre, diferencia);
      }
    });
  
    // Preparar datos para el gráfico (suma total)
    const nombres: string[] = [];
    const diferenciasTotales: number[] = [];
  
    horometrosMap.forEach((total, nombre) => {
      nombres.push(nombre);
      diferenciasTotales.push(total);
    });
  
  
    // Actualizar opciones del gráfico
    this.chartOptions = {
      ...this.chartOptions,
      
      series: [{
        name: 'Diferencia',  // Actualizado
        data: diferenciasTotales
      }],
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: nombres,
        title: { text: 'Horómetros' }
      },
      yaxis: {
        ...this.chartOptions.yaxis,
        title: { text: 'Diferecia Totales (Final - Inicial)' }  // Actualizado
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val.toFixed(2)}`  // Más descriptivo
        }
      }
    };
  
  }
}