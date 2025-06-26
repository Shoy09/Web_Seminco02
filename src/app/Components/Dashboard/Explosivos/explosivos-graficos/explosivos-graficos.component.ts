import { Component, OnInit } from '@angular/core';
import { NubeDatosTrabajoExploraciones, NubeDespacho, NubeDevoluciones } from '../../../../models/nube-datos-trabajo-exploraciones';
import { NubeDatosTrabajoExploracionesService } from '../../../../services/nube-datos-trabajo-exploraciones.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import * as XLSX from 'xlsx-js-style';

@Component({
  selector: 'app-explosivos-graficos',
  imports: [NgApexchartsModule, CommonModule, FormsModule],
  templateUrl: './explosivos-graficos.component.html',
  styleUrl: './explosivos-graficos.component.css'
})
export class ExplosivosGraficosComponent implements OnInit {
    datosExplosivos: NubeDatosTrabajoExploraciones[] = [];
  datosExplosivosOriginal: NubeDatosTrabajoExploraciones[] = [];
    datosExplosivosExport: NubeDatosTrabajoExploraciones[] = [];
  fechaDesde: string = '';
fechaHasta: string = '';
turnoSeleccionado: string = '';
turnos: string[] = ['DÍA', 'NOCHE'];
  constructor(private explosivosService: NubeDatosTrabajoExploracionesService) {}

  ngOnInit(): void {
    const fechaISO = this.obtenerFechaLocalISO();
    this.fechaDesde = fechaISO;
    this.fechaHasta = fechaISO;
    this.turnoSeleccionado = this.obtenerTurnoActual();
  
    this.obtenerDatos();
  }

  obtenerFechaLocalISO(): string {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0'); // meses comienzan en 0
    const dia = hoy.getDate().toString().padStart(2, '0');
    return `${año}-${mes}-${dia}`;
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

    obtenerDatos(): void {
    this.explosivosService.getExplosivos().subscribe({
      next: (data) => {
        console.log('✅ Datos recibidos:', data); //
        this.datosExplosivos = data;
         this.datosExplosivosExport = data;
  
        // Aplicar filtros por fecha actual y turno automáticamente
        const filtros = {
          fechaDesde: this.fechaDesde,
          fechaHasta: this.fechaHasta,
          turnoSeleccionado: this.turnoSeleccionado
        };
  
  

      },
      error: (err) => {
        console.error('❌ Error al obtener datos:', err);
      }
    });
  }

exportarAExcelExplosivos(): void {
  // Crear un nuevo libro de trabajo
  const workbook = XLSX.utils.book_new();
  
  // Preparar los datos para la hoja de Excel
  const { data: excelData, headers: materialHeaders } = this.prepararDatosParaExcel();
  
  // Crear una hoja de trabajo con los datos
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  
  // Añadir la hoja al libro de trabajo
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Explosivos');
  
  // Generar el archivo Excel y descargarlo
  XLSX.writeFile(workbook, 'Reporte_Explosivos.xlsx');
}

private prepararDatosParaExcel(): { data: any[], headers: string[] } {
  const excelData: any[] = [];
  const materialHeaders = new Set<string>();
  
  // Primera pasada: recolectar todos los nombres de materiales únicos
  this.datosExplosivosExport.forEach((dato) => {
    dato.despachos.forEach((despacho) => {
      despacho.detalles.forEach((detalle) => {
        materialHeaders.add(detalle.nombre_material);
      });
    });
    
    dato.devoluciones.forEach((devolucion) => {
      devolucion.detalles.forEach((detalle) => {
        materialHeaders.add(detalle.nombre_material);
      });
    });
  });

  // Segunda pasada: procesar los datos
  this.datosExplosivosExport.forEach((dato) => {
    // Procesar despachos
    dato.despachos.forEach((despacho) => {
      const row = this.crearFilaBase(dato, Array.from(materialHeaders));
      
      // Agregar información específica de despacho
      row['VALE'] = 'DESPACHO';
      row['OBSERVACIONES'] = despacho.observaciones || '';

      row['LONG. EXCEL (MS)'] = despacho.mili_segundo;
      row['LONG. EXCEL (LP)'] = despacho.medio_segundo;
      
      // Procesar detalles de explosivos en despacho
      despacho.detalles_explosivos.forEach((detalle) => {
        const numero = detalle.numero;
        if (numero >= 1 && numero <= 20) {
          row[`MS ${numero}`] = detalle.ms_cant1;
          row[`LP ${numero}`] = detalle.lp_cant1;
        }
      });
      
      // Procesar otros materiales en despacho
      despacho.detalles.forEach((detalle) => {
        row[detalle.nombre_material] = detalle.cantidad;
      });
      
      excelData.push(row);
    });
    
    // Procesar devoluciones
    dato.devoluciones.forEach((devolucion) => {
      const row = this.crearFilaBase(dato, Array.from(materialHeaders));
      
      // Agregar información específica de devolución
      row['VALE'] = 'DEVOLUCIÓN';
      row['OBSERVACIONES'] = devolucion.observaciones || '';
      
      // Procesar detalles de explosivos en devolución
      devolucion.detalles_explosivos.forEach((detalle) => {
        const numero = detalle.numero;
        if (numero >= 1 && numero <= 20) {
          row[`MS ${numero}`] = detalle.ms_cant1;
          row[`LP ${numero}`] = detalle.lp_cant1;
        }
      });
      
      // Procesar otros materiales en devolución
      devolucion.detalles.forEach((detalle) => {
        row[detalle.nombre_material] = detalle.cantidad;
      });
      
      excelData.push(row);
    });
  });
  
  return { data: excelData, headers: Array.from(materialHeaders) };
}

private crearFilaBase(dato: NubeDatosTrabajoExploraciones, materialHeaders: string[]): any {
  // Primero creamos un objeto con todas las propiedades fijas
  const row: any = {
    'ID': dato.id,
    'FECHA': dato.fecha,
    'TURNO': dato.turno,
    'SEMANA': dato.semanaSelect || dato.semanaDefault || '',
    'EMPRESA': dato.empresa || '',
    'ZONA': dato.zona,
    'TIPO DE LABOR': dato.tipo_labor,
    'LABOR': dato.labor,
    'ALA': dato.ala || '',
    'VETA': dato.veta,
    'SECCION': dato.seccion,
    'NIVEL': dato.nivel,
    'TIPO DE PERFORACIÓN': dato.tipo_perforacion,
    'N° TALADROS DISPARADOS': dato.taladro,
    'PIES POR TALADRO': dato.pies_por_taladro
  };

  // Agregamos las columnas de materiales dinámicas
  materialHeaders.forEach(header => {
    row[header] = '';
  });

  // Agregamos las nuevas columnas LONG. EXCEL (MS) y LONG. EXCEL (LP)
  row['LONG. EXCEL (MS)'] = '';
  row['LONG. EXCEL (LP)'] = '';

  // Agregamos las columnas MS en orden (1-20)
  for (let i = 1; i <= 20; i++) {
    row[`MS ${i}`] = '';
  }

  // Agregamos las columnas LP en orden (1-20)
  for (let i = 1; i <= 20; i++) {
    row[`LP ${i}`] = '';
  }

  // Finalmente agregamos las últimas columnas
  row['VALE'] = '';
  row['OBSERVACIONES'] = '';

  return row;
}

}
