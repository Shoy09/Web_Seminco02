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
  ApexAnnotations,
  NgApexchartsModule
} from "ng-apexcharts";
import { FormsModule } from '@angular/forms';
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
  annotations: ApexAnnotations;
};

export type DataDisplayOption = 'taladros' | 'rimados' | 'ambos';

@Component({
  selector: 'app-grafico-barras-agrupada-num-labor',
  imports: [NgApexchartsModule, FormsModule, CommonModule],
  standalone: true,
  templateUrl: './grafico-barras-agrupada-num-labor.component.html',
  styleUrl: './grafico-barras-agrupada-num-labor.component.css'
})
export class GraficoBarrasAgrupadaNumLaborComponent implements OnChanges {
  @Input() datos: any[] = [];
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions> | any;
  
  // Opciones de visualización
  displayOptions: DataDisplayOption[] = ['taladros', 'rimados', 'ambos'];
  selectedDisplay: DataDisplayOption = 'ambos';

  ngOnChanges(changes: SimpleChanges): void {
    this.updateChart();
    if (this.datos && this.datos.length > 0) {
      this.updateChart();
    }
  }

  onDisplayChange(): void {
    this.updateChart();
  }

  private updateChart(): void {
    const processedData = this.processData(this.datos);
      
    this.chartOptions = {
      series: processedData.series,
      chart: {
        type: "bar",
        height: 350,
        stacked: this.selectedDisplay === 'ambos',
        toolbar: {
          show: true
        },
        zoom: {
          enabled: true
        }
      },
      legend: {
        show: processedData.series.length > 1,
        position: 'top',
        horizontalAlign: 'center',
        markers: {
          width: 12,
          height: 12
        }
      },
      plotOptions: { 
        bar: {
          horizontal: false,
          borderRadius: 5,
          endingShape: "rounded",
          dataLabels: {
            total: {
              enabled: true,  // Activar solo los totales
              style: {
                fontSize: '10px',
                fontWeight: 900 
              },
            }
          }
        }
      } as any,
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 1,
        colors: ['#fff']
      },
      xaxis: {
        categories: processedData.categories,
        title: {
          text: 'Labores'
        },
        labels: {
          formatter: (value: string) => value.split('-')[1] || value
        }
      },
      yaxis: {
        min: 0,
        title: {
          text: 'Cantidad'
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val}`
        }
      },
      annotations: {
        points: processedData.annotations
      }
    };
  }

  private processData(data: any[]): { series: any[], categories: string[], annotations: any[] } {
    const categorias: string[] = [];
    const taladros: number[] = [];
    const rimados: number[] = [];
    const annotations: any[] = [];

    const agrupado = new Map<string, { ntaladro: number, ntaladros_rimados: number }>();

    // Agrupar datos por labor
    data.forEach(item => {
      const laborKey = `${item.tipo_labor}-${item.labor}`;

      if (!agrupado.has(laborKey)) {
        agrupado.set(laborKey, { ntaladro: 0, ntaladros_rimados: 0 });
      }

      const actual = agrupado.get(laborKey)!;
      actual.ntaladro += item.ntaladro || 0;
      actual.ntaladros_rimados += item.ntaladros_rimados || 0;
    });

    // Ordenar y preparar datos según la opción seleccionada
    Array.from(agrupado.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([laborKey, valores]) => {
        categorias.push(laborKey);
        
        // Calcular valores según la selección
        let total = 0;
        let showTaladros = false;
        let showRimados = false;

        switch(this.selectedDisplay) {
          case 'taladros':
            total = valores.ntaladro;
            showTaladros = true;
            break;
          case 'rimados':
            total = valores.ntaladros_rimados;
            showRimados = true;
            break;
          case 'ambos':
            total = valores.ntaladro + valores.ntaladros_rimados;
            showTaladros = true;
            showRimados = true;
            break;
        }

        if (showTaladros) taladros.push(valores.ntaladro);
        if (showRimados) rimados.push(valores.ntaladros_rimados);

        // Configurar anotaciones
        annotations.push({
          x: laborKey,
          y: total,
          label: {
            text: `${total}`,
            borderColor: 'transparent',
            style: {
              background: 'transparent',
              color: '#000',
              fontSize: '12px',
              fontWeight: 'bold',
              padding: 0
            },
            offsetY: -5
          },
          marker: {
            size: 0,
            fillColor: 'transparent',
            strokeColor: 'transparent'
          }
        });
      });

    // Preparar series según la selección
    const series = [];
    if (this.selectedDisplay === 'taladros' || this.selectedDisplay === 'ambos') {
      series.push({
        name: 'Taladros',
        data: taladros,
        color: '#4CAF50'
      });
    }
    if (this.selectedDisplay === 'rimados' || this.selectedDisplay === 'ambos') {
      series.push({
        name: 'Rimados',
        data: rimados,
        color: '#FF9800'
      });
    }

    return {
      categories: categorias,
      series,
      annotations
    };
  }

  constructor() {
    this.chartOptions = {
      series: [],
      chart: {
        type: "bar",
        height: 350
      },
      xaxis: {
        categories: []
      }
    };
  }
}