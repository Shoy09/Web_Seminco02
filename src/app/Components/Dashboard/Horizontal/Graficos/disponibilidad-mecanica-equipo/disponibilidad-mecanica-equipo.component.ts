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
  ApexTooltip,
  NgApexchartsModule
} from "ng-apexcharts";
import { CommonModule } from '@angular/common';

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
  colors: string[];
};

@Component({
  selector: 'app-disponibilidad-mecanica-equipo',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './disponibilidad-mecanica-equipo.component.html',
  styleUrl: './disponibilidad-mecanica-equipo.component.css'
})
export class DisponibilidadMecanicaEquipoComponent implements OnChanges {
  @Input() datos: any[] = [];
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: ChartOptions;

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

  private getDefaultOptions(): ChartOptions {
    return {
      series: [{
        name: "Disponibilidad Mecánica",
        data: []
      }],
      colors: [],
      chart: {
        type: "bar",
        height: 350,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 5,
          columnWidth: '70%',
          dataLabels: {
            position: 'top'
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => {
          return `${val.toFixed(2)}%`;
        },
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ["#333"]
        }
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      },
      xaxis: {
        categories: [],
        labels: {
          rotate: -45,
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        // title: {
        //   text: 'Disponibilidad (%)',
        //   style: {
        //     fontSize: '12px'
        //   }
        // },
        min: 0,
        max: 100,
        labels: {
          formatter: (val: number) => {
            return `${val}%`;
          }
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: (val: number) => {
            return `${val.toFixed(2)}%`;
          }
        }
      },
      legend: {
        show: false
      }
    };
  }

  private updateChart(): void {
    if (!this.datos || this.datos.length === 0) {
      console.warn('No hay datos para mostrar');
      return;
    }
    
    const processedData = this.processData(this.datos);
    
    this.chartOptions = {
      ...this.chartOptions,
      series: [{
        name: "Disponibilidad Mecánica",
        data: processedData.disponibilidadMecanica
      }],
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: processedData.categories
      }
    };
    
    setTimeout(() => {
      if (this.chart && this.chart.updateSeries) {
        this.chart.updateSeries([{
          name: "Disponibilidad Mecánica",
          data: processedData.disponibilidadMecanica
        }]);
      }
    }, 100);
  }

  private processData(data: any[]): { 
    categories: string[], 
    disponibilidadMecanica: number[] 
  } {
    // Calcular duración para cada registro
    const datosConDuracion = data.map(item => {
      const inicio = this.parseHora(item.hora_inicio).getTime();
      const fin = this.parseHora(item.hora_final).getTime();
      let duracionHoras = (fin - inicio) / (1000 * 60 * 60);
      if (duracionHoras < 0) duracionHoras += 24;
  
      return {
        ...item,
        duracion: duracionHoras > 0 ? duracionHoras : 0
      };
    });
  
    // Obtener operaciones únicas
    const operacionesUnicas = Array.from(new Set(datosConDuracion.map(item => item.codigoOperacion)));
    
    // Calcular disponibilidad mecánica para cada operación
    const disponibilidadMecanica = operacionesUnicas.map(operacion => {
      const itemsOperacion = datosConDuracion.filter(item => item.codigoOperacion === operacion);
      
      // Calcular tiempos por estado
      const tiempoOperativo = this.sumDuracionPorEstado(itemsOperacion, 'OPERATIVO');
      const tiempoDemora = this.sumDuracionPorEstado(itemsOperacion, 'DEMORA');
      const tiempoMantenimiento = this.sumDuracionPorEstado(itemsOperacion, 'MANTENIMIENTO');
      const tiempoReserva = this.sumDuracionPorEstado(itemsOperacion, 'RESERVA');
      const tiempoFueraPlan = this.sumDuracionPorEstado(itemsOperacion, 'FUERA DE PLAN');
      
      // Realizar cálculos según la fórmula
      const tiempoOperativoCalculo = tiempoOperativo + tiempoDemora + tiempoMantenimiento;
      const tiempoDisponible = tiempoOperativoCalculo + tiempoReserva;
      const nominal = tiempoDisponible + tiempoFueraPlan;
      
      // Calcular disponibilidad mecánica
      if (nominal === 0) return 0; // Evitar división por cero
      
      const disponibilidad = ((nominal - tiempoMantenimiento) / nominal) * 100;
      return parseFloat(disponibilidad.toFixed(2));
    });
  
    return {
      categories: operacionesUnicas,
      disponibilidadMecanica: disponibilidadMecanica
    };
  }

  private sumDuracionPorEstado(items: any[], estado: string): number {
    return items
      .filter(item => item.estado.toUpperCase() === estado.toUpperCase())
      .reduce((sum, item) => sum + item.duracion, 0);
  }

  private parseHora(horaString: string): Date {
    const [horas, minutos] = horaString.split(':').map(Number);
    const date = new Date();
    date.setHours(horas, minutos, 0, 0);
    return date;
  }
}