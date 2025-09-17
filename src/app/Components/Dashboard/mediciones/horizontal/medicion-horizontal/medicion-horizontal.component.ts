import { Component, OnInit } from '@angular/core';
import { ExcelMedicionesHorizontalService } from './excel-mediciones-horizontal.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicionesHorizontal } from '../../../../../models/MedicionesHorizontal';
import { MedicionesHorizontalService } from '../../../../../services/mediciones-horizontal.service';
import { FactorAvanceComponent } from "../graficos/factor-avance/factor-avance.component";
import { Tonelada } from '../../../../../models/tonelada';
import { ToneladasService } from '../../../../../services/toneladas.service';
import { FactorAvanceSegundoComponent } from "../graficos/factor-avance-segundo/factor-avance-segundo.component";

@Component({
  selector: 'app-medicion-horizontal',
  templateUrl: './medicion-horizontal.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule, FactorAvanceComponent, FactorAvanceSegundoComponent],
  styleUrls: ['./medicion-horizontal.component.css']
})
export class MedicionHorizontalComponent implements OnInit {
  datosOperaciones: MedicionesHorizontal[] = [];
  datosOperacionesExport: MedicionesHorizontal[] = [];
  datosOperacionesOriginal: MedicionesHorizontal[] = [];

  fechaDesde: string = '';
  fechaHasta: string = '';
  turnoSeleccionado: string = '';
  turnos: string[] = ['DÍA', 'NOCHE'];

  toneladas: Tonelada[] = [];

  constructor(private medicionService: MedicionesHorizontalService,
  private excelService: ExcelMedicionesHorizontalService, private toneladasService: ToneladasService ) {}

  ngOnInit(): void {
    const fechaISO = this.obtenerFechaLocalISO();
    this.fechaDesde = fechaISO;
    this.fechaHasta = fechaISO;
    this.turnoSeleccionado = this.obtenerTurnoActual();

    this.obtenerDatos();
    this.obtenerToneladas(); 
  }

  obtenerTurnoActual(): string {
    const ahora = new Date();
    const hora = ahora.getHours();

    if (hora >= 7 && hora < 19) {
      return 'DÍA';
    } else {
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
  }

  obtenerFechaLocalISO(): string {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const dia = hoy.getDate().toString().padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  aplicarFiltrosLocales(): void {
    const filtros = {
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
      turnoSeleccionado: this.turnoSeleccionado
    };

    this.datosOperaciones = this.filtrarDatos(this.datosOperacionesOriginal, filtros);
  }

  filtrarDatos(datos: MedicionesHorizontal[], filtros: any): MedicionesHorizontal[] {
    return datos.filter(operacion => {
      const fechaOperacion = new Date(operacion.fecha);
      const fechaDesde = filtros.fechaDesde ? new Date(filtros.fechaDesde) : null;
      const fechaHasta = filtros.fechaHasta ? new Date(filtros.fechaHasta) : null;

      if (fechaDesde && fechaOperacion < fechaDesde) return false;
      if (fechaHasta && fechaOperacion > fechaHasta) return false;
      if (filtros.turnoSeleccionado && operacion.turno !== filtros.turnoSeleccionado) return false;

      return true;
    });
  }

  obtenerDatos(): void {
    this.medicionService.getMediciones().subscribe({
      next: (data: MedicionesHorizontal[]) => {
        
        this.datosOperacionesOriginal = data;
        this.datosOperacionesExport = data;

        const filtros = {
          fechaDesde: this.fechaDesde,
          fechaHasta: this.fechaHasta,
          turnoSeleccionado: this.turnoSeleccionado
        };

        this.datosOperaciones = this.filtrarDatos(this.datosOperacionesOriginal, filtros);
console.log("✅ Datos recibidos del servicio:", data);
      },
      error: (err) => {
        console.error('❌ Error al obtener datos:', err);
      }
    });
  }

  obtenerToneladas(): void {
    this.toneladasService.getToneladas().subscribe({
      next: (data: Tonelada[]) => {
        this.toneladas = data;
        console.log("📦 Toneladas recibidas:", data);
      },
      error: (err) => {
        console.error("❌ Error al obtener toneladas:", err);
      }
    });
  }

  exportarFiltrado() {
  this.excelService.exportFiltradaToExcel(this.datosOperaciones, 'MedicionesHorizontal');
}

// Exportar toda la data
exportarCompleto() {
  this.excelService.exportCompletaToExcel(this.datosOperacionesExport, 'MedicionesHorizontal');
}
}
