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
};

@Component({
  selector: 'app-grafico-barras-agrupada',
  imports: [NgApexchartsModule],
  standalone: true,
  templateUrl: './grafico-barras-agrupada.component.html',
  styleUrl: './grafico-barras-agrupada.component.css'
})
export class GraficoBarrasAgrupadaComponent implements OnChanges {
  @Input() datos: any[] = [];
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions> | any;

  ngOnChanges(changes: SimpleChanges): void {
    this.updateChart();
    if (this.datos && this.datos.length > 0) {
      this.updateChart();
    } else {
    } 
  }

  private updateChart(): void {
    const processedData = this.processData(this.datos);
  
    this.chartOptions = {
      series: processedData.series,
      chart: {
        type: "bar",
        height: 350,
        stacked: true,
        toolbar: {
          show: true
        },
        zoom: {
          enabled: true
        }
      },
      legend: {
        show: true,
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
        enabled: false // ❌ Desactivamos etiquetas dentro de las barras
        
      },
      stroke: {
        show: true,
        width: 1,
        colors: ['#fff']
      },
      xaxis: {
        categories: processedData.categories,
        title: {
          text: 'Equipos'
        }
      },
      yaxis: {
        min: 0,
        title: {
          text: 'Número de Taladros'
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val} taladro(s)`
        }
      },
      annotations: {
        points: processedData.annotations // ✅ Etiquetas personalizadas arriba de cada barra
      }
    };
  }
  
  private processData(data: any[]): { series: any[], categories: string[], annotations: any[] } {
    const categorias: string[] = [];
    const taladros: number[] = [];
    const rimados: number[] = [];
    const annotations: any[] = [];
  
    const agrupado = new Map<string, { ntaladro: number, ntaladros_rimados: number }>();
  
    data.forEach(item => {
      const codigo = item.codigo;
  
      if (!agrupado.has(codigo)) {
        agrupado.set(codigo, { ntaladro: 0, ntaladros_rimados: 0 });
      }
  
      const actual = agrupado.get(codigo)!;
      actual.ntaladro += item.ntaladro || 0;
      actual.ntaladros_rimados += item.ntaladros_rimados || 0;
    });
  
    Array.from(agrupado.entries()).sort(([a], [b]) => a.localeCompare(b)).forEach(([codigo, valores], index) => {
      categorias.push(codigo);
      taladros.push(valores.ntaladro);
      rimados.push(valores.ntaladros_rimados);
  
      const total = valores.ntaladro + valores.ntaladros_rimados;
  
      annotations.push({
        x: codigo,
        y: total,
        label: {
          text: `${total}`,
          borderColor: 'transparent',
          style: {
            background: 'transparent',
            color: '#000',
            fontSize: '12px',
            fontWeight: 'bold',
            padding: 0 // 🔥 Elimina espacio interno
          },
          offsetY: -5
        },
        marker: {
          size: 0,
          fillColor: 'transparent', // 🔥 asegúrate que no pinta nada
          strokeColor: 'transparent'
        }
      });           
    });
  
    return {
      categories: categorias,
      series: [
        { name: 'Taladros', data: taladros },
        { name: 'Rimados', data: rimados }
      ],
      annotations
    };
  }
}  