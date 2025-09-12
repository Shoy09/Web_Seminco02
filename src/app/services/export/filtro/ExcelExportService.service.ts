import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { NubeInterPerforacionTaladroLargo, NubeOperacion, NubePerforacionTaladroLargo } from '../../../models/operaciones.models';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportServiceLargoFiltro {
exportOperacionesToExcel(datosOperaciones: NubeOperacion[], fileName: string) {
  // Filtrar solo operaciones con estado "Cerrado"
  const operacionesCerradas = datosOperaciones.filter(op => 
    op.estado?.toLowerCase() === 'cerrado' // Case-insensitive
  );

  // Preparar datos para cada hoja (usando solo operaciones cerradas)
  const ejecutadoData = this.prepareEjecutadoData(operacionesCerradas);
  const estadosData = this.prepareEstadosData(operacionesCerradas);

  // Resto del código permanece igual...
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  const ejecutadoWS = XLSX.utils.json_to_sheet(ejecutadoData);
  const estadosWS = XLSX.utils.json_to_sheet(estadosData);

  this.adjustColumnWidth(ejecutadoWS, ejecutadoData);
  this.adjustColumnWidth(estadosWS, estadosData);

  XLSX.utils.book_append_sheet(wb, ejecutadoWS, 'EJECUTADOTL');
  XLSX.utils.book_append_sheet(wb, estadosWS, 'ESTADOSTL');

  XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().slice(0,10)}.xlsx`);
}

private prepareEjecutadoData(operaciones: NubeOperacion[]): any[] {
    const data: any[] = [];

    // Orden de prioridad para Taladro Largo
    const ordenPrioridad = ['Diesel', 'Electrico', 'Percusion'];

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
        // Ordenar horómetros según Diesel, Electrico, Percusion y luego los demás
        const horometrosOrdenados = [...op.horometros].sort((a, b) => {
          const idxA = ordenPrioridad.indexOf(a.nombre);
          const idxB = ordenPrioridad.indexOf(b.nombre);

          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.nombre.localeCompare(b.nombre); // otros alfabéticamente
        });

        horometrosOrdenados.forEach(horometro => {
          const nombreNormalizado = horometro.nombre.replace(/\s+/g, '_');

          rowData[`Horómetro ${nombreNormalizado} - Inicial`] = horometro.inicial;
          rowData[`Horómetro ${nombreNormalizado} - Final`] = horometro.final;
          rowData[`Diferencia ${nombreNormalizado}`] = horometro.final - horometro.inicial;

          let estadoOperativo;
          if (horometro.EstaOP && !horometro.EstaINOP) {
            estadoOperativo = 'Sí';
          } else if (!horometro.EstaOP && horometro.EstaINOP) {
            estadoOperativo = 'No';
          } else {
            estadoOperativo = 'Sin definir';
          }

          rowData[`Horómetro ${nombreNormalizado} - Operativo`] = estadoOperativo;
        });
      }

      // Procesar perforaciones taladro largo
      if (op.perforaciones && op.perforaciones.length > 0) {
        op.perforaciones.forEach((perf: NubePerforacionTaladroLargo) => {
          // Agregar datos de perforación
          rowData['Perf. - Zona'] = perf.zona || '';
          rowData['Perf. - Tipo Labor'] = perf.tipo_labor || '';
          rowData['Perf. - Labor'] = perf.labor || '';
          rowData['Perf. - Veta'] = perf.veta || '';
          rowData['Perf. - Nivel'] = perf.nivel || '';
          rowData['Perf. - Tipo Perforación'] = perf.tipo_perforacion || '';

          // Procesar interperforaciones
          if (perf.inter_perforaciones && perf.inter_perforaciones.length > 0) {
            perf.inter_perforaciones.forEach((inter: NubeInterPerforacionTaladroLargo) => {
              const nTaladro = inter.ntaladro || 0;
              const longitud = inter.longitud_perforacion || 0;
              const metrosPerforados = nTaladro * longitud;

              rowData['Ejecutado - Código Actividad'] = inter.codigo_actividad || '';
              rowData['Ejecutado - Nivel'] = inter.nivel || '';
              rowData['Ejecutado - Tajo'] = inter.tajo || '';
              rowData['Ejecutado - N° Broca'] = inter.nbroca || '';
              rowData['Ejecutado - N° Taladro'] = inter.ntaladro || '';
              rowData['Ejecutado - N° Barras'] = inter.nbarras || '';
              rowData['Ejecutado - Longitud'] = inter.longitud_perforacion || '';
              rowData['Ejecutado - Ángulo'] = inter.angulo_perforacion || '';
              rowData['Ejecutado - N° Filas'] = inter.nfilas_de_hasta || '';
              rowData['Ejecutado - Detalles'] = inter.detalles_trabajo_realizado || '';
              rowData['Metros perforados'] = metrosPerforados;
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
      if (op.estados && op.estados.length > 0) {
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
        // Si no hay estados, exportar solo datos básicos de operación
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

    // Calcular el ancho máximo para cada columna
    headers.forEach((header, i) => {
      // Ancho mínimo basado en el encabezado
      let maxWidth = header.length * 1.2;
      
      // Verificar el contenido de cada fila
      data.forEach(row => {
        const value = row[header];
        if (value !== undefined && value !== null) {
          const length = value.toString().length;
          if (length > maxWidth) {
            maxWidth = length * 1.1;
          }
        }
      });

      // Limitar entre 10 y 50 caracteres de ancho
      const width = Math.min(Math.max(maxWidth, 10), 50);
      columnWidths.push({ wch: width });
    });

    worksheet['!cols'] = columnWidths;
  }
}