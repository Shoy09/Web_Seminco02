import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { NubeInterSostenimiento, NubeOperacion, NubeSostenimiento } from '../../../models/operaciones.models';

@Injectable({
  providedIn: 'root'
})
export class ExcelSostenimientoExportService {
  exportOperacionesToExcel(datosOperacionesExport: NubeOperacion[], fileName: string) {

      const operacionesCerradas = datosOperacionesExport.filter(op => 
    op.estado?.toLowerCase() === 'cerrado' // Case-insensitive
  );

    // Preparar datos para cada hoja
    const ejecutadoData = this.prepareEjecutadoData(operacionesCerradas);
    const estadosData = this.prepareEstadosData(operacionesCerradas);

    // Crear un nuevo libro de trabajo
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    // Añadir hojas al libro
    const ejecutadoWS = XLSX.utils.json_to_sheet(ejecutadoData);
    const estadosWS = XLSX.utils.json_to_sheet(estadosData);

    // Ajustar el ancho de las columnas
    this.adjustColumnWidth(ejecutadoWS, ejecutadoData);
    this.adjustColumnWidth(estadosWS, estadosData);
    
    XLSX.utils.book_append_sheet(wb, ejecutadoWS, 'EJECUTADOSOS');
    XLSX.utils.book_append_sheet(wb, estadosWS, 'ESTADOSSOS');

    // Exportar el archivo
    XLSX.writeFile(wb, `${fileName}_Sostenimiento_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  private prepareEjecutadoData(operaciones: NubeOperacion[]): any[] {
    const data: any[] = [];

    const ordenPrioridad = ['Electrico', 'Percusion', 'Diesel'];

    operaciones.forEach(op => {
      // Datos base de la operación
      const rowData: any = {
        'ID Operación': op.id,
        'Turno': op.turno,
        'Equipo': op.equipo,
        'Código': op.codigo,
        'Empresa': op.empresa,
        'Fecha': op.fecha,
        'Tipo Operación': op.tipo_operacion,
        'Estado': op.estado,
      };

      // Procesar horómetros
      if (op.horometros && op.horometros.length > 0) {
        // Ordenar primero por prioridad (Electrico, Percusion, Diesel) y luego por nombre
        const horometrosOrdenados = [...op.horometros].sort((a, b) => {
          const idxA = ordenPrioridad.indexOf(a.nombre);
          const idxB = ordenPrioridad.indexOf(b.nombre);

          // Si ambos están en la lista de prioridad, respetar su orden
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          // Si uno está en la lista y el otro no, el que está en la lista va primero
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          // Si ninguno está en la lista, ordenar alfabéticamente
          return a.nombre.localeCompare(b.nombre);
        });

        horometrosOrdenados.forEach(horometro => {
          const nombreNormalizado = horometro.nombre.replace(/\s+/g, '_');

          rowData[`Horómetro ${nombreNormalizado} - Inicial`] = horometro.inicial;
          rowData[`Horómetro ${nombreNormalizado} - Final`] = horometro.final;
          rowData[`Diferencia ${nombreNormalizado}`] = horometro.final - horometro.inicial;

          const opValue = horometro.EstaOP;
          const inopValue = horometro.EstaINOP;
          let estadoOperativo;

          if (opValue && !inopValue) {
            estadoOperativo = 'Sí';
          } else if (!opValue && inopValue) {
            estadoOperativo = 'No';
          } else {
            estadoOperativo = 'Sin definir';
          }

          rowData[`Horómetro ${nombreNormalizado} - Operativo`] = estadoOperativo;
        });
      }

      // Procesar sostenimientos
      if (op.sostenimientos && op.sostenimientos.length > 0) {
        op.sostenimientos.forEach((sost: NubeSostenimiento) => {
          // Agregar datos de sostenimiento
          rowData['Sost. - Zona'] = sost.zona || '';
          rowData['Sost. - Tipo Labor'] = sost.tipo_labor || '';
          rowData['Sost. - Labor'] = sost.labor || '';
          rowData['Sost. - Veta'] = sost.veta || '';
          rowData['Sost. - Nivel'] = sost.nivel || '';
          rowData['Sost. - Tipo Perforación'] = sost.tipo_perforacion || '';
          // rowData['Sost. - Observación'] = sost.observacion || '';

          // Procesar inter-sostenimientos
          if (sost.inter_sostenimientos && sost.inter_sostenimientos.length > 0) {
            sost.inter_sostenimientos.forEach((inter: NubeInterSostenimiento) => {
              rowData['Ejecutado - Código Actividad'] = inter.codigo_actividad || '';
              rowData['Ejecutado - Nivel'] = inter.nivel || '';
              rowData['Ejecutado - Labor'] = inter.labor || '';
              rowData['Ejecutado - Sección'] = inter.seccion_de_labor || '';
              rowData['Ejecutado - N° Broca'] = inter.nbroca || '';
              rowData['Ejecutado - N° Taladro'] = inter.ntaladro || '';
              // rowData['Ejecutado - Material'] = inter.material || '';
              rowData['Ejecutado - Longitud'] = inter.longitud_perforacion || '';
              rowData['Ejecutado - Malla Instalada'] = inter.malla_instalada || '';
              // rowData['Ejecutado - Detalles'] = inter.detalles_trabajo_realizado || '';
              // rowData['Ejecutado - Metros perforados'] = inter.metros_perforados || 0;
            });
          }
        });
      }

      const fechaMina = this.calcularFechaMina(op.fecha, op.turno);
      rowData['Fecha_Mina'] = fechaMina;
      data.push(rowData);
    });

    return data;
  }

  private prepareEstadosData(operaciones: NubeOperacion[]): any[] {
    const data: any[] = [];
    
    operaciones.forEach(op => {
      const fechaMina = this.calcularFechaMina(op.fecha, op.turno);
      if (op.estados?.length) {
        op.estados.forEach(estado => {
          // Datos base del estado
          const estadoBase = {
            'ID Operación': op.id,
            'ID Estado': estado.id,
            'Número Estado': estado.numero,
            'Estado': estado.estado,
            'Código Estado': estado.codigo,
            'Hora Inicio': estado.hora_inicio,
            'Hora Final': estado.hora_final,
            'Fecha_Mina': fechaMina,
          };

          data.push(estadoBase);
        });
      } else {
        data.push({
          'ID Operación': op.id,
          'Mensaje': 'No hay estados registrados para esta operación',
          'Fecha_Mina': fechaMina,
        });
      }
    });
    
    return data;
  }

  private calcularFechaMina(fechaOriginal: string, turno: string): string {
    if (!fechaOriginal) return '';
    
    // Si el turno es "Noche", sumar un día a la fecha original
    if (turno?.toLowerCase() === 'noche') {
      const fecha = new Date(fechaOriginal);
      fecha.setDate(fecha.getDate() + 1);
      return fecha.toISOString().split('T')[0];
    }
    
    // Para cualquier otro caso (incluyendo turno "Dia"), usar la fecha original
    return fechaOriginal.split('T')[0];
  }

  private adjustColumnWidth(worksheet: XLSX.WorkSheet, data: any[]) {
    if (!data || data.length === 0) return;

    const columnWidths: XLSX.ColInfo[] = [];
    const headers = Object.keys(data[0]);

    headers.forEach((header, i) => {
      let maxWidth = header.length * 1.2;
      
      data.forEach(row => {
        const value = row[header];
        if (value !== undefined && value !== null) {
          const length = value.toString().length;
          if (length > maxWidth) {
            maxWidth = length * 1.1;
          }
        }
      });

      const width = Math.min(Math.max(maxWidth, 10), 50);
      columnWidths.push({ wch: width });
    });

    worksheet['!cols'] = columnWidths;
  }
}