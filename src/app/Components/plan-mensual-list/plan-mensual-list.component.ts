import { Component, OnInit, ViewChild } from '@angular/core';
import { PlanMensual } from '../../models/plan-mensual.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { PlanMensualService } from '../../services/plan-mensual.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import * as XLSX from 'xlsx';
import { LoadingDialogComponent } from '../loading-dialog/loading-dialog.component';
import { PlanDetallesDialogComponent } from '../plan-detalles-dialog/plan-detalles-dialog.component';
import { FechasPlanMensualService } from '../../services/fechas-plan-mensual.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-plan-mensual-list',
  imports: [
    MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatInputModule, 
        MatFormFieldModule
  ],
  templateUrl: './plan-mensual-list.component.html',
  styleUrl: './plan-mensual-list.component.css'
})
export class PlanMensualListComponent implements OnInit {
  displayedColumns: string[] = [
    'anio', 'mes', 'minado_tipo', 'zona', 
    'tipo_mineral', 'fase', 'labor', 'acciones'
  ];
  dataSource = new MatTableDataSource<PlanMensual>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private _toastr: ToastrService, private planMensualService: PlanMensualService, public dialog: MatDialog, private fechasPlanMensualService: FechasPlanMensualService) {}
  errorMessage: string = '';
  anio: number | undefined;
  mes: string | undefined;
  ngOnInit(): void {
    this.obtenerUltimaFecha();
  }

  obtenerUltimaFecha(): void {
    this.fechasPlanMensualService.getUltimaFecha().subscribe(
      (ultimaFecha) => {
        console.log('Última fecha obtenida:', ultimaFecha);
        
        // Asignar los valores de anio y mes
        const anio: number | undefined = ultimaFecha.fecha_ingreso;
        const mes: string = ultimaFecha.mes;
  
        // Verificar que 'anio' no sea undefined antes de llamar a la función
        if (anio !== undefined) {
          this.anio = anio;  // Asignamos el valor de anio a la propiedad del componente
          this.mes = mes;    // Asignamos el valor de mes a la propiedad del componente
          this.obtenerPlanesMensuales(anio, mes);
        } else {
          console.error('Fecha de ingreso no válida');
        }
      },
      (error) => {
        console.error('Error al obtener la última fecha:', error);
      }
    );
  }
  
  
  obtenerPlanesMensuales(anio: number, mes: string): void {
    this.planMensualService.getPlanMensualByYearAndMonth(anio, mes).subscribe(
      (planes) => {
        this.dataSource.data = planes;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      (error) => {
        console.error('Error al obtener los planes mensuales:', error);
      }
    );
  }
  
  

  aplicarFiltro(event: Event) {
    const filtroValor = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filtroValor;
  }

  seleccionarArchivo(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  cargarArchivo(event: any): void {
    const archivo = event.target.files[0];
    if (!archivo) return;
  
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = "PLAN METRAJE AVANCES"; // Nombre específico de la hoja
      const sheet = workbook.Sheets[sheetName];
  
      if (!sheet) {
        console.error(`La hoja "${sheetName}" no existe en el archivo.`);
        return;
      }
  
      // Convertimos los datos en formato JSON
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);
      const totalFilas = jsonData.length; // Contar filas del archivo
      
      // Almacenar errores de filas
      const errores: string[] = []; 
  
      // Convertir datos a modelo PlanMensual
      const planes: PlanMensual[] = jsonData.map((fila: any, index: number) => {
        const anioFila = fila["AÑO"];
        const mesFila = fila["MES"];
  
        // Verificar si el año y mes coinciden
        if (anioFila !== this.anio || mesFila !== this.mes) {
          errores.push(`Error en la fila ${index + 1}: El año y mes no coinciden. Año: ${anioFila}, Mes: ${mesFila}`);
        }
        
        return this.mapearFilaAPlanMensual(fila);
      });
  
      // Si hay errores, mostrar la notificación usando toastr
      if (errores.length > 0) {
        this.errorMessage = errores.join('\n'); // Unir los errores en un solo mensaje
        console.error(this.errorMessage);
  
        // Mostrar el mensaje de error usando toastr
        this._toastr.error(this.errorMessage, 'Error en el archivo', {
          closeButton: true,  // Agregar un botón para cerrar la notificación
          progressBar: true,  // Mostrar una barra de progreso
          timeOut: 5000       // Duración del mensaje
        });
        return;
      }
  
      // Enviar los datos al backend si no hay errores
      this.enviarDatosAlServidor(planes);
    };
  
    reader.readAsArrayBuffer(archivo);
  }
  

  mapearFilaAPlanMensual(fila: any): PlanMensual {
    return {
      anio: fila["AÑO"],
      mes: fila["MES"],
      minado_tipo: fila["MINADO/TIPO"],
      empresa: fila["EMPRESA"],
      zona: fila["ZONA"],
      area: fila["AREA"],
      tipo_mineral: fila["TIPO DE MINERAL"],
      fase: fila["FASE"],
      estructura_veta: fila["ESTRUCTURA/VETA"],
      nivel: fila["NIVEL"],
      tipo_labor: fila["TIPO LABOR"],
      labor: fila["LABOR"],
      ala: fila["ALA"],
      avance_m: fila["AVANCE (m)"],
      ancho_m: fila["ANCHO (m)"],
      alto_m: fila["ALTO (m)"],
      tms: fila["TMS "],
      // Mapeo dinámico de columnas 1A - 28B
      ...Object.fromEntries(
        Array.from({ length: 28 }, (_, i) => [
          `col_${i + 1}A`, fila[`${i + 1}A`] !== undefined ? fila[`${i + 1}A`].toString().trim() : null
        ])
      ),
      ...Object.fromEntries(
        Array.from({ length: 28 }, (_, i) => [
          `col_${i + 1}B`, fila[`${i + 1}B`] !== undefined ? fila[`${i + 1}B`].toString().trim() : null
        ])
      )
    };
  }

  enviarDatosAlServidor(planes: PlanMensual[]): void {
    this.mostrarPantallaCarga(); // Mostrar el diálogo de carga
  
    let enviados = 0;
    let errores = 0;
  
    planes.forEach((plan, index) => {
      this.planMensualService.createPlanMensual(plan).subscribe(
        response => {
          enviados++;
          this.verificarCargaCompleta(planes.length, enviados, errores);
        },
        error => {
          errores++;
          this.verificarCargaCompleta(planes.length, enviados, errores);
        }
      );
    });
  }
  
  verificarCargaCompleta(total: number, enviados: number, errores: number): void {
    if (enviados + errores === total) {
      this.dialog.closeAll(); // Cerrar la pantalla de carga
      this.obtenerUltimaFecha(); // Recargar la tabla con los nuevos datos
  
      // Mostrar una notificación de éxito si todo salió correctamente
      if (errores === 0) {
        this._toastr.success('Los datos se cargaron correctamente', 'Carga exitosa', {
          closeButton: true,
          progressBar: true,
          timeOut: 5000
        });
      } else {
        this._toastr.error(`Hubo ${errores} errores durante la carga`, 'Error en la carga', {
          closeButton: true,
          progressBar: true,
          timeOut: 5000
        });
      }
    }
  }
  
mostrarPantallaCarga() {
  this.dialog.open(LoadingDialogComponent, {
    disableClose: true
  });
}

editarPlan(plan: any): void {
  console.log("Editar plan:", plan);
  // Aquí puedes abrir un diálogo o navegar a una pantalla de edición
}

eliminarPlan(plan: any): void {
  if (confirm(`¿Está seguro de eliminar el plan del año ${plan.anio}?`)) {
    console.log("Eliminar plan:", plan);
    // Llamar al servicio para eliminar el plan
  }
}

verPlan(plan: any): void {
  this.dialog.open(PlanDetallesDialogComponent, {
    width: '400px', // Ajusta el tamaño según necesites
    data: plan
  });
}
   
}