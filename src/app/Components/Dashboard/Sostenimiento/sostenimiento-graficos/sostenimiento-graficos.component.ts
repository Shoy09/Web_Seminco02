import { Component, OnInit } from '@angular/core';
import { NubeOperacion } from '../../../../models/operaciones.models';
import { OperacionService } from '../../../../services/OperacionService .service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MetrosPerforadosEquipoComponent } from "../Graficos/metros-perforados-equipo/metros-perforados-equipo.component";
import { MetrosPerforadosLaborComponent } from "../Graficos/metros-perforados-labor/metros-perforados-labor.component";
import { HorometrosComponent } from "../Graficos/horometros/horometros.component";
import { MallaInstaladaEquipoComponent } from "../Graficos/malla-instalada-equipo/malla-instalada-equipo.component";
import { MallaInstaladaLaborComponent } from "../Graficos/malla-instalada-labor/malla-instalada-labor.component";
import { RendimientoDePerforacionesComponent } from "../Graficos/rendimiento-de-perforaciones/rendimiento-de-perforaciones.component";
import { DisponibilidadMecanicaEquipoComponent } from "../Graficos/disponibilidad-mecanica-equipo/disponibilidad-mecanica-equipo.component";
import { DisponibilidadMecanicaGeneralComponent } from "../Graficos/disponibilidad-mecanica-general/disponibilidad-mecanica-general.component";
import { UtilizacionGeneralComponent } from "../Graficos/utilizacion-general/utilizacion-general.component";
import { UtilizacionEquipoComponent } from "../Graficos/utilizacion-equipo/utilizacion-equipo.component";
import { GraficoEstadosComponent } from '../Graficos/grafico-estados/grafico-estados.component';
import { PromedioDeEstadosGeneralComponent } from '../Graficos/promedio-de-estados-general/promedio-de-estados-general.component';
import { Meta } from '../../../../models/meta.model';
import { MetaSostenimientoService } from '../../../../services/meta-sostenimiento.service';

@Component({
  selector: 'app-sostenimiento-graficos',
  imports: [NgApexchartsModule, CommonModule, FormsModule, MetrosPerforadosEquipoComponent, MetrosPerforadosLaborComponent, HorometrosComponent, GraficoEstadosComponent, PromedioDeEstadosGeneralComponent, MallaInstaladaEquipoComponent, MallaInstaladaLaborComponent, RendimientoDePerforacionesComponent, DisponibilidadMecanicaEquipoComponent, DisponibilidadMecanicaGeneralComponent, UtilizacionGeneralComponent, UtilizacionEquipoComponent],
  templateUrl: './sostenimiento-graficos.component.html',
  styleUrl: './sostenimiento-graficos.component.css'
})
export class SostenimientoGraficosComponent implements OnInit {
  datosOperaciones: NubeOperacion[] = [];
  datosGraficobarrasapiladasLargo: any[] = [];
  datosHorometros: any[] = [];
  datosGraficoEstados: any[] = [];
  datosOperacionesOriginal: NubeOperacion[] = [];
  datosGraficoMallas: any[] = [];
  RendimientoPerforacion: any[] = [];
  fechaDesde: string = '';
fechaHasta: string = '';
turnoSeleccionado: string = '';
turnos: string[] = ['DÍA', 'NOCHE'];
private todasLasMetas: Meta[] = [];
  metasPorGrafico: { 
    [key: string]: Meta[] 
  } = {
    'METROS PERFORADOS - EQUIPO': [],
    'METROS PERFORADOS - LABOR': [],
    'ESTADOS': [],
    'ESTADOS GENERAL': [],
    'MALLA - EQUIPO': [],
    'MALLA - LABOR': [],
    'HOROMETROS': [],
    'RENDIMIENTO DE PERFORACION - EQUIPO': [],
    'DISPONIBILIDAD MECANICA - EQUIPO': [],
    'DISPONIBILIDAD MECANICA - GENERAL': [],
    'UTILIZACION - EQUIPO': [],
    'UTILIZACION - GENERAL': [],
  };


  constructor(private metaService: MetaSostenimientoService, private operacionService: OperacionService) {}
 
  ngOnInit(): void {
    const fechaISO = this.obtenerFechaLocalISO();
    this.fechaDesde = fechaISO;
    this.fechaHasta = fechaISO;
    this.turnoSeleccionado = this.obtenerTurnoActual();
  
    this.obtenerDatos();
    this.cargarMetasDesdeApi();
  }

  private cargarMetasDesdeApi(): void {
    this.metaService.getMetas().subscribe({
      next: (metas: Meta[]) => {
        if (metas && metas.length > 0) {
          this.todasLasMetas = metas;
  
          // Filtrar y agrupar las metas según el campo "grafico"
          metas.forEach(meta => {
            if (this.metasPorGrafico[meta.grafico]) {
              this.metasPorGrafico[meta.grafico].push(meta);
            }
          });
  
          // Mostrar en consola las metas por gráfico
        } else {
        }
      },
      error: (error) => {
      }
    });
  }

  obtenerTurnoActual(): string {
    const ahora = new Date();
    const hora = ahora.getHours();
  
    // Turno de día: 7:00 AM a 6:59 PM (07:00 - 18:59)
    if (hora >= 7 && hora < 19) {
      return 'DÍA';
    } else {
      // Turno de noche: 7:00 PM a 6:59 AM
      return 'NOCHE';
    }
  }  

  private filtrarMetasPorMes(fecha: string): void {
    const mesSeleccionado = this.obtenerMesDeFecha(fecha);
    
    // Reiniciamos todas las metas por gráfico
    Object.keys(this.metasPorGrafico).forEach(key => {
      this.metasPorGrafico[key] = [];
    });
  
    // Filtramos las metas por el mes seleccionado
    this.todasLasMetas.forEach(meta => {
      if (meta.mes === mesSeleccionado && this.metasPorGrafico[meta.grafico]) {
        this.metasPorGrafico[meta.grafico].push(meta);
      }
    });
  }
  
  quitarFiltros(): void {
    const fechaISO = this.obtenerFechaLocalISO();
    this.fechaDesde = fechaISO;
    this.fechaHasta = fechaISO;
    this.turnoSeleccionado = this.obtenerTurnoActual();
  
    const filtros = {
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
      turnoSeleccionado: this.turnoSeleccionado
    };
  
    this.datosOperaciones = this.filtrarDatos(this.datosOperacionesOriginal, filtros);
    
    // Filtrar metas según el mes actual
    this.filtrarMetasPorMes(this.fechaDesde);
    
    this.reprocesarTodosLosGraficos();
  }

  obtenerFechaLocalISO(): string {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0'); // meses comienzan en 0
    const dia = hoy.getDate().toString().padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }
  

  aplicarFiltrosLocales(): void {
    // Crear objeto con los filtros actuales
    const filtros = {
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
      turnoSeleccionado: this.turnoSeleccionado
    };
  
    // Aplicar filtros a los datos ORIGINALES (this.datosOperacionesOriginal)
    const datosFiltrados = this.filtrarDatos(this.datosOperacionesOriginal, filtros);
  
    // Actualizar los datos filtrados
    this.datosOperaciones = datosFiltrados;
  
    // Filtrar metas según el mes de la fecha de inicio
    this.filtrarMetasPorMes(this.fechaDesde);
  
    // Reprocesar los gráficos con los datos filtrados
    this.reprocesarTodosLosGraficos();
  }

  private obtenerMesDeFecha(fecha: string): string {
    if (!fecha) return '';
    
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const date = new Date(fecha);
    return meses[date.getMonth()];
  }
  
  filtrarDatos(datos: NubeOperacion[], filtros: any): NubeOperacion[] {
    return datos.filter(operacion => {
      const fechaOperacion = new Date(operacion.fecha);
      const fechaDesde = filtros.fechaDesde ? new Date(filtros.fechaDesde) : null;
      const fechaHasta = filtros.fechaHasta ? new Date(filtros.fechaHasta) : null;
  
      // Verificar si la fecha de operación está dentro del rango
      if (fechaDesde && fechaOperacion < fechaDesde) {
        return false;
      }
  
      if (fechaHasta && fechaOperacion > fechaHasta) {
        return false;
      }
  
      // Verificar si el turno de la operación coincide con el turno seleccionado
      if (filtros.turnoSeleccionado && operacion.turno !== filtros.turnoSeleccionado) {
        return false;
      }
  
      return true;
    });
  }
   
  
  reprocesarTodosLosGraficos(): void {
    this.prepararDatosGraficoBarrasApilada();
    this.prepararDatosHorometros();
    this.prepararDatosGraficoEstados();
    this.prepararDatosMalla();
    this.prepararDatoRendimientoPerforacion();
  }

  obtenerDatos(): void {
    this.operacionService.getOperacionesSostenimiento().subscribe({
      next: (data) => {
        this.datosOperacionesOriginal = data;
  
        // Aplicar filtros por fecha actual y turno automáticamente
        const filtros = {
          fechaDesde: this.fechaDesde,
          fechaHasta: this.fechaHasta,
          turnoSeleccionado: this.turnoSeleccionado
        };
  
        this.datosOperaciones = this.filtrarDatos(this.datosOperacionesOriginal, filtros);
  
        // Procesar datos para los gráficos
        this.prepararDatosGraficoBarrasApilada();
        this.prepararDatosHorometros();
        this.prepararDatosGraficoEstados();
        this.prepararDatosMalla();
        this.prepararDatoRendimientoPerforacion();
      },
      error: (err) => {
        console.error('❌ Error al obtener datos:', err);
      }
    });
  }

  prepararDatosGraficoBarrasApilada(): void {
    this.datosGraficobarrasapiladasLargo = this.datosOperaciones.flatMap(operacion => {
      return operacion.sostenimientos?.flatMap(perforacion => {
        return perforacion.inter_sostenimientos?.map(inter => ({
          equipo: operacion.equipo,
          codigo: operacion.codigo,
          longitud_perforacion: inter.longitud_perforacion,
          tipo_labor: perforacion.tipo_labor,
          labor: perforacion.labor,
          ntaladro: inter.ntaladro,
        })) || [];
      }) || [];
    });
  }

  prepararDatosHorometros(): void {
    this.datosHorometros = this.datosOperaciones.flatMap(operacion => 
      operacion.horometros?.map(horometro => ({
        operacionId: operacion.id,
        equipo: operacion.equipo,
        codigo: operacion.codigo,
        turno: operacion.turno,
        fecha: operacion.fecha,
        nombreHorometro: horometro.nombre,
        inicial: horometro.inicial,
        final: horometro.final,
        diferencia: horometro.final - horometro.inicial,
        EstaOP: horometro.EstaOP,
        EstaINOP: horometro.EstaINOP
      })) || []
    );
  }

  prepararDatosGraficoEstados(): void {
    this.datosGraficoEstados = this.datosOperaciones.flatMap(operacion => 
      operacion.estados?.map(estado => ({
        codigoOperacion: operacion.codigo,
        turno: operacion.turno,
        estado: estado.estado,
        codigoEstado: estado.codigo,
        hora_inicio: estado.hora_inicio,
        hora_final: estado.hora_final
      })) || []
    );
  }

  prepararDatosMalla(): void {
    this.datosGraficoMallas = this.datosOperaciones.flatMap(operacion => {
      return operacion.sostenimientos?.flatMap(perforacion => {
        return perforacion.inter_sostenimientos?.map(inter => ({
          codigo: operacion.codigo,
          malla_instalada: inter.malla_instalada,
          tipo_labor: perforacion.tipo_labor,
          labor: perforacion.labor,
        })) || [];
      }) || [];
    });
  }

  prepararDatoRendimientoPerforacion(): void {
    const agrupadoPorOperacion = new Map<string, {
      codigo: string;
      estados: {
        estado: string;
        codigoEstado: string;
        hora_inicio: string;
        hora_final: string;
      }[];
      perforaciones: {
        longitud_perforacion: number;
        ntaladro: number;
      }[];
    }>();
  
    for (const operacion of this.datosOperaciones) {
      const codigo = operacion.codigo;
      if (!agrupadoPorOperacion.has(codigo)) {
        agrupadoPorOperacion.set(codigo, {
          codigo,
          estados: (operacion.estados || []).map(estado => ({
            estado: estado.estado,
            codigoEstado: estado.codigo,
            hora_inicio: estado.hora_inicio,
            hora_final: estado.hora_final
          })),
          perforaciones: []
        });
      }
  
      const grupo = agrupadoPorOperacion.get(codigo)!;
  
      operacion.sostenimientos?.forEach(perforacion => {
        perforacion.inter_sostenimientos?.forEach(inter => {
          grupo.perforaciones.push({
            longitud_perforacion: inter.longitud_perforacion,
            ntaladro: inter.ntaladro
          });
        });
      });
    }
  
    // Convertimos el mapa en array final
    this.RendimientoPerforacion = Array.from(agrupadoPorOperacion.values());
  
  }
  
  

}
