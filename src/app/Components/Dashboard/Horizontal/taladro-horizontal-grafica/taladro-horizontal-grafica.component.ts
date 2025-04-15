import { Component, OnInit } from '@angular/core';

import { NubeOperacion } from '../../../../models/operaciones.models';
import { GraficoBarrasComponent } from "../Graficos/grafico-barras/grafico-barras.component";
import { CommonModule } from '@angular/common';
import { OperacionService } from '../../../../services/OperacionService .service';
import { GraficoBarrasAgrupadaComponent } from "../Graficos/grafico-barras-agrupada/grafico-barras-agrupada.component";
import { PromNumTaladroTipoLaborComponent } from "../Graficos/prom-num-taladro-tipo-labor/prom-num-taladro-tipo-labor.component";
import { PromMetrosPerforadosSeccionComponent } from "../Graficos/prom-metros-perforados-seccion/prom-metros-perforados-seccion.component";
import { PromNumTaladroSeccionComponent } from "../Graficos/prom-num-taladro-seccion/prom-num-taladro-seccion.component";
import { GraficoHorometrosComponent } from "../Graficos/grafico-horometros/grafico-horometros.component";
import { GraficoBarrasMetrosLaborComponent } from "../Graficos/grafico-barras-metros-labor/grafico-barras-metros-labor.component";
import { GraficoBarrasAgrupadaNumLaborComponent } from "../Graficos/grafico-barras-agrupada-num-labor/grafico-barras-agrupada-num-labor.component";
import { GraficoEstadosComponent } from "../Graficos/grafico-estados/grafico-estados.component";
import { FormsModule } from '@angular/forms';
import { PromedioTaladrosComponent } from "../Graficos/promedio-taladros/promedio-taladros.component";
import { BarrasMetroPerforadosLaborComponent } from "../Graficos/barras-metro-perforados-labor/barras-metro-perforados-labor.component";
import { PromedioDeEstadosGeneralComponent } from "../Graficos/promedio-de-estados-general/promedio-de-estados-general.component";
import { RendimientoDePerforacionesComponent } from "../Graficos/rendimiento-de-perforaciones/rendimiento-de-perforaciones.component";

@Component({
  selector: 'app-taladro-horizontal-grafica',
  standalone: true,
  imports: [FormsModule, GraficoBarrasComponent, CommonModule, GraficoBarrasAgrupadaComponent, PromNumTaladroTipoLaborComponent, PromMetrosPerforadosSeccionComponent, GraficoHorometrosComponent, GraficoBarrasMetrosLaborComponent, GraficoBarrasAgrupadaNumLaborComponent, GraficoEstadosComponent, PromedioTaladrosComponent, BarrasMetroPerforadosLaborComponent, PromedioDeEstadosGeneralComponent, RendimientoDePerforacionesComponent],
  templateUrl: './taladro-horizontal-grafica.component.html',
  styleUrl: './taladro-horizontal-grafica.component.css'
}) 
export class TaladroHorizontalGraficaComponent implements OnInit {
  datosOperaciones: NubeOperacion[] = [];
  datosGraficobarrasapiladas: any[] = [];
  datosGraficobarrasagrupadas: any[] = [];
  paraPromedioTaladrosSeccion: any[] = [];
  RendimientoPerforacion: any[] = [];
  ParaPromediosPromnumtaladrotipolabor: any[] = [];
  ParaPromediostaladrosmetrosperforadosSeccion: any[] = [];
  ParaPromediostaladrosnumtaladroSeccion: any[] = [];
  datosHorometros: any[] = [];
  datosGraficoEstados: any[] = [];
  datosOperacionesOriginal: NubeOperacion[] = [];


  fechaDesde: string = '';
fechaHasta: string = '';
turnoSeleccionado: string = '';
turnos: string[] = ['DÍA', 'NOCHE'];


  constructor(private operacionService: OperacionService) {}

  ngOnInit(): void {
    const fechaISO = this.obtenerFechaLocalISO();
    this.fechaDesde = fechaISO;
    this.fechaHasta = fechaISO;
    this.turnoSeleccionado = this.obtenerTurnoActual();
  
    this.obtenerDatos();
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
  
    // Reprocesar los gráficos con los datos filtrados
    this.reprocesarTodosLosGraficos();
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
    this.prepararDatosGraficoBarrasAgrupada();
    this.prepararDatosParaPromediostaladrosSeccion();
    this.prepararDatosParaPromnumtaladrotipolabor();
    this.prepararDatosParaPromediostaladrosmetrosperforadosSeccion();
    this.prepararDatosParaPromediostaladrosSecciónnumtaladroSeccion();
    this.prepararDatosHorometros();
    this.prepararDatosGraficoEstados();
    this.prepararDatoRendimientoPerforacion();
  }
 
  obtenerDatos(): void {
    this.operacionService.getOperacionesHorizontal().subscribe({
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
        this.prepararDatosGraficoBarrasAgrupada();
        this.prepararDatosParaPromediostaladrosSeccion();
        this.prepararDatosParaPromnumtaladrotipolabor();
        this.prepararDatosParaPromediostaladrosmetrosperforadosSeccion();
        this.prepararDatosParaPromediostaladrosSecciónnumtaladroSeccion();
        this.prepararDatosHorometros();
        this.prepararDatosGraficoEstados();
        this.prepararDatoRendimientoPerforacion();
      },
      error: (err) => {
        console.error('❌ Error al obtener datos:', err);
      }
    });
  }

  prepararDatosGraficoBarrasApilada(): void {
    this.datosGraficobarrasapiladas = this.datosOperaciones.flatMap(operacion => {
      return operacion.perforaciones_horizontal?.flatMap(perforacion => {
        return perforacion.inter_perforaciones_horizontal?.map(inter => ({
          equipo: operacion.equipo,
          codigo: operacion.codigo,
          longitud_perforacion: inter.longitud_perforacion,
          tipo_labor: perforacion.tipo_labor,
          labor: perforacion.labor,
          ntaladro: inter.ntaladro,
          ntaladros_rimados: inter.ntaladros_rimados,
        })) || [];
      }) || [];
    });
  }

prepararDatosGraficoBarrasAgrupada(): void {
  this.datosGraficobarrasagrupadas = this.datosOperaciones.flatMap(operacion => 
    operacion.perforaciones_horizontal?.flatMap(perforacion => 
      perforacion.inter_perforaciones_horizontal?.map(inter => ({
        equipo: operacion.equipo,
        codigo: operacion.codigo,
        tipo_labor: perforacion.tipo_labor,
        labor: perforacion.labor,
        ntaladro: inter.ntaladro || 0,
        ntaladros_rimados: inter.ntaladros_rimados || 0
      })) || []
    ) || []
  );
}

prepararDatosParaPromediostaladrosSeccion(): void {
  this.paraPromedioTaladrosSeccion = this.datosOperaciones.flatMap(operacion => 
    operacion.perforaciones_horizontal?.flatMap(perforacion => 
      perforacion.inter_perforaciones_horizontal?.map(inter => ({
        seccion_la_labor: inter.seccion_la_labor,
        ntaladro: inter.ntaladro || 0,
        ntaladros_rimados: inter.ntaladros_rimados || 0,
      })) || []
    ) || []
  );
} 
 
prepararDatosParaPromnumtaladrotipolabor(): void {
  this.ParaPromediosPromnumtaladrotipolabor = this.datosOperaciones.flatMap(operacion => 
    operacion.perforaciones_horizontal?.flatMap(perforacion => 
      perforacion.inter_perforaciones_horizontal?.map(inter => ({
        ntaladro: inter.ntaladro || 0,
        ntaladros_rimados: inter.ntaladros_rimados || 0,
        tipo_labor: perforacion.tipo_labor,
        labor: perforacion.labor,
      })) || []
    ) || []
  );
}

prepararDatosParaPromediostaladrosmetrosperforadosSeccion(): void {
  this.ParaPromediostaladrosmetrosperforadosSeccion = this.datosOperaciones.flatMap(operacion => 
    operacion.perforaciones_horizontal?.flatMap(perforacion => 
      perforacion.inter_perforaciones_horizontal?.map(inter => ({
        seccion_la_labor: inter.seccion_la_labor,
        longitud_perforacion: inter.longitud_perforacion,
        ntaladro: inter.ntaladro,
        ntaladros_rimados: inter.ntaladros_rimados,
      })) || []
    ) || []
  );
}

prepararDatosParaPromediostaladrosSecciónnumtaladroSeccion(): void {
  this.ParaPromediostaladrosnumtaladroSeccion = this.datosOperaciones.flatMap(operacion => 
    operacion.perforaciones_horizontal?.flatMap(perforacion => 
      perforacion.inter_perforaciones_horizontal?.map(inter => ({
        seccion_la_labor: inter.seccion_la_labor,
        ntaladro: inter.ntaladro || 0,
      })) || []
    ) || []
  );
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
      ntaladros_rimados: number;
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

    operacion.perforaciones_horizontal?.forEach(perforacion => {
      perforacion.inter_perforaciones_horizontal?.forEach(inter => {
        grupo.perforaciones.push({
          longitud_perforacion: inter.longitud_perforacion,
          ntaladro: inter.ntaladro,
          ntaladros_rimados: inter.ntaladros_rimados
        });
      });
    });
  }

  // Convertimos el mapa en array final
  this.RendimientoPerforacion = Array.from(agrupadoPorOperacion.values());

  console.log("📦 Datos de RendimientoPerforacion:", this.RendimientoPerforacion);
}


}
