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
  const excelData = this.prepararDatosParaExcel();
  
  // Crear una hoja de trabajo con los datos
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  
  // Añadir la hoja al libro de trabajo
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Explosivos');
  
  // Generar el archivo Excel y descargarlo
  XLSX.writeFile(workbook, 'Reporte_Explosivos.xlsx');
}

private prepararDatosParaExcel(): any[] {
  const excelData: any[] = [];
  
  this.datosExplosivosExport.forEach((dato) => {
    // Procesar despachos
    dato.despachos.forEach((despacho) => {
      const row = this.crearFilaBase(dato);
      
      // Agregar información específica de despacho
      row['VALE'] = 'DESPACHO';
      row['OBSERVACIONES'] = despacho.observaciones || '';
      
      // Procesar detalles de explosivos en despacho
      despacho.detalles_explosivos.forEach((detalle) => {
        const numero = detalle.numero;
        if (numero >= 1 && numero <= 20) {
          row[`MS ${numero}`] = detalle.ms_cant1;
          row[`LP ${numero}`] = detalle.lp_cant1;
        }
      });
      
      // Procesar otros materiales en despacho con mapeo flexible
      despacho.detalles.forEach((detalle) => {
        const nombreNormalizado = this.normalizarNombreMaterial(detalle.nombre_material);
        if (nombreNormalizado && row.hasOwnProperty(nombreNormalizado)) {
          row[nombreNormalizado] = detalle.cantidad;
        }
      });
      
      excelData.push(row);
    });
    
    // Procesar devoluciones
    dato.devoluciones.forEach((devolucion) => {
      const row = this.crearFilaBase(dato);
      
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
      
      // Procesar otros materiales en devolución con mapeo flexible
      devolucion.detalles.forEach((detalle) => {
        const nombreNormalizado = this.normalizarNombreMaterial(detalle.nombre_material);
        if (nombreNormalizado && row.hasOwnProperty(nombreNormalizado)) {
          row[nombreNormalizado] = detalle.cantidad;
        }
      });
      
      excelData.push(row);
    });
  });
  
  return excelData;
}

// Función para normalizar los nombres de materiales
private normalizarNombreMaterial(nombre: string): string | null {
  // Limpieza robusta del nombre
  const nombreLimpio = nombre
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/[×x]/g, 'X')
    .replace(/["”]/g, '"')
    .replace(/\s*"\s*/g, '"')
    .replace(/\s*\/\s*/g, '/')
    .replace(/[áäà]/g, 'A')
    .replace(/[éëè]/g, 'E')
    .replace(/[íïì]/g, 'I')
    .replace(/[óöò]/g, 'O')
    .replace(/[úüù]/g, 'U');

  // Mapeo ampliado con variantes
  const mapeo: { [key: string]: string } = {
    'MECHA RÁPIDA': 'MECHA RAPIDA',
    'MECHA RAPIDA': 'MECHA RAPIDA',
    'CARMEX ': 'CARMEX',
    'CARMEX': 'CARMEX',
    'CORDON DETONANTE 4P': 'CORDON DETONANTE',
    'CORDON DETONANTE': 'CORDON DETONANTE',
    'EXEL 4.20M': 'EXEL 4.2M',
    'EXEL 4.2M': 'EXEL 4.2M',
    'EXEL 15.0M': 'EXEL 15.0M',
    'SENATEL PULSAR 1 1/2X12"': 'SENATEL PULSAR 1 1/2"X12"',
    'SENATEL PULSAR 1 1/2"X12"': 'SENATEL PULSAR 1 1/2"X12"',
    'SENATEL PULSAR 1 1/4X12"': 'SENATEL PULSAR 1 1/4"X12"',
    'SENATEL PULSAR 1 1/4"X12"': 'SENATEL PULSAR 1 1/4"X12"',
    'SENATEL ULTREX 1 1/2X12"': 'SENATEL ULTREX 1 1/2"X12"',
    'SENATEL ULTREX 1 1/2"X12"': 'SENATEL ULTREX 1 1/2"X12"',
    'SENATEL ULTREX 1 1/4X12"': 'SENATEL ULTREX 1 1/4"X12"',
    'SENATEL ULTREX 1 1/4"X12"': 'SENATEL ULTREX 1 1/4"X12"',
    'SENATEL MAGNAFRAC 1 1/4X12"': 'SENATEL MAGNAFRAC 1 1/4"X12"',
    'SENATEL MAGNAFRAC 1 1/4"X12"': 'SENATEL MAGNAFRAC 1 1/4"X12"',
    'ANFO': 'ANFO',
    'LONG. EXCEL': 'LONG. EXCEL'
  };

  // Intentar coincidencia directa
  if (mapeo[nombreLimpio]) {
    return mapeo[nombreLimpio];
  }

  // Intentar coincidencia flexible
  const entradaNormalizada = nombreLimpio.replace(/\s+/g, ' ').trim();

  for (const [key, value] of Object.entries(mapeo)) {
    const keyNormalizado = key.replace(/\s+/g, ' ').trim();
    if (entradaNormalizada === keyNormalizado) {
      return value;
    }
  }

  return null;
}

private crearFilaBase(dato: NubeDatosTrabajoExploraciones): any {
  // Primero creamos un objeto con todas las propiedades en el orden deseado
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
    'SECCION': '',
    'NIVEL': dato.nivel,
    'TIPO DE PERFORACIÓN': dato.tipo_perforacion,
    'N° TALADROS DISPARADOS': dato.taladro,
    'PIES POR TALADRO': dato.pies_por_taladro,
    'CARMEX': '',
    'MECHA RAPIDA': '',
    'CORDON DETONANTE': '',
    'EXEL 4.2M': '',
    'EXEL 15.0M': '',
    'SENATEL PULSAR 1 1/2"X12"': '',
    'SENATEL PULSAR 1 1/4"X12"': '',
    'SENATEL ULTREX 1 1/2"X12"': '',
    'SENATEL ULTREX 1 1/4"X12"': '',
    'SENATEL MAGNAFRAC 1 1/4"X12"': '',
    'ANFO': '',
    'LONG. EXCEL': ''
  };

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
