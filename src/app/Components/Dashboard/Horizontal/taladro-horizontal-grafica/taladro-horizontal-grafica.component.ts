import { Component, OnInit } from '@angular/core';
import { OperacionService } from '../../../../services/OperacionService .service';
import { NubeOperacion } from '../../../../models/operaciones.models';
import { NubePerforacionHorizontal, NubeInterPerforacionHorizontal } from '../../../../models/operaciones.models';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexStroke,
  ApexTooltip,
  NgApexchartsModule
} from 'ng-apexcharts';
import * as XLSX from 'xlsx';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis?: ApexYAxis;
  legend?: ApexLegend;
  stroke?: ApexStroke;
  tooltip?: ApexTooltip;
  colors?: string[]; // Añadido colors aquí
};

@Component({
  selector: 'app-taladro-horizontal-grafica',
  imports: [NgApexchartsModule],
  templateUrl: './taladro-horizontal-grafica.component.html',
  styleUrl: './taladro-horizontal-grafica.component.css'
})
export class TaladroHorizontalGraficaComponent implements OnInit {
  datosOperaciones: NubeOperacion[] = [];
  chartOptions!: ChartOptions;
  chartOptionsTaladros!: ChartOptions; // Nuevo gráfico para taladros

  constructor(private operacionService: OperacionService) {}

  ngOnInit(): void {
    this.obtenerDatos();
  }

  obtenerDatos(): void {
    this.operacionService.getOperacionesHorizontal().subscribe({
      next: (data) => {
        this.datosOperaciones = data;
        console.log('📊 Datos recibidos:', data);
        this.generarGraficoLongitud();
        this.generarGraficoTaladros(); // Generar el nuevo gráfico
      },
      error: (err) => {
        console.error('❌ Error al obtener datos:', err);
      }
    });
  }

  exportarAExcel(): void {
    try {
      // Obtener todos los datos aplanados
      const datosExportar = this.prepararDatosCompletosParaExportacion();
      
      // Crear hoja de trabajo
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosExportar);
      
      // Crear libro de trabajo
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'OperacionesCompletas');
      
      // Exportar el archivo
      const fecha = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `OperacionesCompletas_${fecha}.xlsx`);
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      // Mostrar mensaje de error al usuario si es necesario
    }
  }
  
  prepararDatosCompletosParaExportacion(): any[] {
    return this.datosOperaciones.map(op => {
      // Objeto base que contendrá todos los datos
      const filaExcel: any = {};
  
      // 1. Datos principales de la operación
      this.agregarDatosOperacion(filaExcel, op);
  
      // 2. Datos de estados (todos los estados)
      this.agregarDatosEstados(filaExcel, op.estados || []);
  
      // 3. Datos de perforaciones (todas las perforaciones)
      this.agregarDatosPerforaciones(filaExcel, op.perforaciones_horizontal || []);
  
      // 4. Datos de horómetros (todos los horómetros)
      this.agregarDatosHorometros(filaExcel, op.horometros || []);
  
      return filaExcel;
    });
  }
  
  agregarDatosOperacion(filaExcel: any, op: NubeOperacion): void {
    // Datos básicos de la operación
    filaExcel['ID Operación'] = op.id;
    filaExcel['Turno'] = op.turno;
    filaExcel['Equipo'] = op.equipo;
    filaExcel['Código Equipo'] = op.codigo;
    filaExcel['Empresa'] = op.empresa;
    filaExcel['Fecha'] = op.fecha;
    filaExcel['Tipo Operación'] = op.tipo_operacion;
    filaExcel['Estado'] = op.estado;
    filaExcel['Envío'] = op.envio;
  }
  
  agregarDatosEstados(filaExcel: any, estados: any[]): void {
    estados.forEach((estado, index) => {
      const prefijo = `Estado ${index + 1} - `;
      filaExcel[prefijo + 'ID'] = estado.id;
      filaExcel[prefijo + 'Número'] = estado.numero;
      filaExcel[prefijo + 'Estado'] = estado.estado;
      filaExcel[prefijo + 'Código'] = estado.codigo;
      filaExcel[prefijo + 'Hora Inicio'] = estado.hora_inicio;
      filaExcel[prefijo + 'Hora Final'] = estado.hora_final;
    });
  
    // Agregar contadores
    filaExcel['Total Estados'] = estados.length;
    filaExcel['Estados Operativos'] = estados.filter(e => e.estado === 'OPERATIVO').length;
    filaExcel['Estados Demora'] = estados.filter(e => e.estado === 'DEMORA').length;
  }
  
  agregarDatosPerforaciones(filaExcel: any, perforaciones: NubePerforacionHorizontal[]): void {
    perforaciones.forEach((perf, pIndex) => {
      const prefijoPerf = `Perf ${pIndex + 1} - `;
      
      // Datos de la perforación principal
      filaExcel[prefijoPerf + 'ID'] = perf.id;
      filaExcel[prefijoPerf + 'Zona'] = perf.zona;
      filaExcel[prefijoPerf + 'Tipo Labor'] = perf.tipo_labor;
      filaExcel[prefijoPerf + 'Labor'] = perf.labor;
      filaExcel[prefijoPerf + 'Veta'] = perf.veta;
      filaExcel[prefijoPerf + 'Nivel'] = perf.nivel;
      filaExcel[prefijoPerf + 'Tipo Perforación'] = perf.tipo_perforacion;
  
      // Datos de inter-perforaciones
      (perf.inter_perforaciones_horizontal || []).forEach((inter: NubeInterPerforacionHorizontal, iIndex: number) => {
        const prefijoInter = `${prefijoPerf}Inter ${iIndex + 1} - `;
        
        filaExcel[prefijoInter + 'ID'] = inter.id;
        filaExcel[prefijoInter + 'Código Actividad'] = inter.codigo_actividad;
        filaExcel[prefijoInter + 'Nivel'] = inter.nivel;
        filaExcel[prefijoInter + 'Labor'] = inter.labor;
        filaExcel[prefijoInter + 'Sección Labor'] = inter.seccion_la_labor;
        filaExcel[prefijoInter + 'N° Broca'] = inter.nbroca;
        filaExcel[prefijoInter + 'N° Taladros'] = inter.ntaladro;
        filaExcel[prefijoInter + 'N° Taladros Rimados'] = inter.ntaladros_rimados;
        filaExcel[prefijoInter + 'Longitud Perforación'] = inter.longitud_perforacion;
        filaExcel[prefijoInter + 'Detalles Trabajo'] = inter.detalles_trabajo_realizado;
      });
    });
  
    // Agregar contadores
    filaExcel['Total Perforaciones'] = perforaciones.length;
    filaExcel['Total InterPerforaciones'] = perforaciones.reduce(
      (total, perf) => total + (perf.inter_perforaciones_horizontal?.length || 0), 0
    );
  }
  
  
  agregarDatosHorometros(filaExcel: any, horometros: any[]): void {
    horometros.forEach((hor, index) => {
      const prefijo = `Horómetro ${index + 1} - `;
      filaExcel[prefijo + 'ID'] = hor.id;
      filaExcel[prefijo + 'Nombre'] = hor.nombre;
      filaExcel[prefijo + 'Inicial'] = hor.inicial;
      filaExcel[prefijo + 'Final'] = hor.final;
      filaExcel[prefijo + 'EstaOP'] = hor.EstaOP;
      filaExcel[prefijo + 'EstaINOP'] = hor.EstaINOP;
    });
  
    // Agregar contador
    filaExcel['Total Horómetros'] = horometros.length;
  }

  generarGraficoLongitud(): void {
    const seriesData: number[] = [];
    const categories: string[] = [];

    this.datosOperaciones.forEach(op => {
      const equipo = op.equipo;
      const labor = op.perforaciones_horizontal?.[0]?.labor ?? '';
      const perforaciones = op.perforaciones_horizontal?.[0]?.inter_perforaciones_horizontal ?? [];

      perforaciones.forEach(p => {
        categories.push(`${equipo} - ${labor}`);
        seriesData.push(p.longitud_perforacion);
      });
    });

    this.chartOptions = {
      series: [
        {
          name: "Longitud Perforación",
          data: seriesData
        }
      ],
      chart: {
        type: "bar",
        height: 350
      },
      colors: ['#008FFB'], // Color azul para diferenciar
      title: {
        text: "Longitud de Perforación por Equipo y Labor"
      },
      xaxis: {
        categories: categories
      },
      dataLabels: {
        enabled: false // Deshabilitado por defecto para este gráfico
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
        }
      }
    };
  }

  generarGraficoTaladros(): void {
    const seriesData: number[] = [];
    const categories: string[] = [];

    this.datosOperaciones.forEach(op => {
      const equipo = op.equipo;
      const labor = op.perforaciones_horizontal?.[0]?.labor ?? '';
      const perforaciones = op.perforaciones_horizontal?.[0]?.inter_perforaciones_horizontal ?? [];

      perforaciones.forEach(p => {
        categories.push(`${equipo} - ${labor}`);
        seriesData.push(p.ntaladro);
      });
    });

    this.chartOptionsTaladros = {
      series: [
        {
          name: "Número de Taladros",
          data: seriesData
        }
      ],
      chart: {
        type: "bar",
        height: 350
      },
      colors: ['#FF4560'], // Movido al nivel superior
      title: {
        text: "Número de Taladros por Equipo y Labor"
      },
      xaxis: {
        categories: categories
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
        }
      },
      dataLabels: {
        enabled: true
      }
    };
  }
}