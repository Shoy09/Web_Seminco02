import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import * as XLSX from 'xlsx';
import { PlanProduccionDetallesDialogComponent } from '../plan-produccion-detalles-dialog/plan-produccion-detalles-dialog.component';

import { ToastrService } from 'ngx-toastr';
import { PlanProduccion } from '../../../../models/plan_produccion.model';
import { FechasPlanMensualService } from '../../../../services/fechas-plan-mensual.service';
import { PlanProduccionService } from '../../../../services/plan-produccion.service';
import { LoadingDialogComponent } from '../../../Reutilizables/loading-dialog/loading-dialog.component';
import { EditPlanProduccionComponent } from '../edit-plan-produccion/edit-plan-produccion.component';
import { CreatePlanProduccionComponent } from '../create-plan-produccion/create-plan-produccion.component';

@Component({
  selector: 'app-plan-produccion-list',
  imports: [MatTableModule,
      MatPaginatorModule,
      MatSortModule,
      MatButtonModule,
      MatIconModule,
      MatDialogModule,
      MatInputModule, 
      MatFormFieldModule],
  templateUrl: './plan-produccion-list.component.html',
  styleUrl: './plan-produccion-list.component.css'
})
export class PlanProduccionListComponent implements OnInit {
  displayedColumns: string[] = [
    'mes', 'semana', 'mina', 'zona', 
    'tipo_mineral', 'labor', 'acciones'
  ];
  dataSource = new MatTableDataSource<PlanProduccion>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private _toastr: ToastrService,
    private planProduccionService: PlanProduccionService,
    public dialog: MatDialog,
    private fechasPlanMensualService: FechasPlanMensualService
  ) {}
  errorMessage: string = '';
  anio: number | undefined;
  mes: string | undefined;

  ngOnInit(): void {
    this.obtenerUltimaFecha();
  }

  obtenerUltimaFecha(): void {
    this.fechasPlanMensualService.getUltimaFecha().subscribe(
      (ultimaFecha) => {
        
        
        // Usar el operador de encadenamiento opcional y comprobar si es undefined
        const anio: number | undefined = ultimaFecha.fecha_ingreso;
        const mes: string = ultimaFecha.mes;
  
        // Verificar que 'anio' no sea undefined antes de llamar a la función
        if (anio !== undefined) {
          this.anio = anio;  // Asignamos el valor de anio a la propiedad del componente
          this.mes = mes; 
          this.obtenerPlanesMetraje(anio, mes);
        } else {
          console.error('Fecha de ingreso no válida');
        }
      },
      (error) => {
        console.error('Error al obtener la última fecha:', error);
      }
    );
  }

  obtenerPlanesMetraje(anio: number, mes: string): void {
    this.planProduccionService.getPlanMensualByYearAndMonth(anio, mes).subscribe(
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

  aplicarFiltro(event: Event): void {
    const filtroValor = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filtroValor;
  }

    abrirDialogoCrear(): void {
      const dialogRef = this.dialog.open(CreatePlanProduccionComponent, {
        width: '500px',
        data: { 
          anio: this.anio, 
          mes: this.mes 
        }
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if (result) { // Si el resultado es `true`, significa que se creó un nuevo plan
          this.obtenerUltimaFecha(); // Llamamos a la función para actualizar la lista
        }
      });
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
      const sheetName = "PLAN PRODUCCIÓN";
      const sheet = workbook.Sheets[sheetName];
  
      if (!sheet) {
        this._toastr.error(`La hoja "${sheetName}" no existe en el archivo.`, 'Error');
        return;
      }
  
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);
      const errores: string[] = [];
  
      // 1. Filtrar filas válidas (año/mes correctos) y mapear
      const planesValidos: PlanProduccion[] = jsonData
        .filter((fila: any, index: number) => {
          const anioFila = Number(fila["AÑO"]);
          const mesFila = String(fila["MES"]).trim().toUpperCase();
  
          if (anioFila !== this.anio || mesFila !== this.mes) {
            errores.push(`Fila ${index + 1} ignorada: Año/Mes no coinciden (Año: ${anioFila}, Mes: ${mesFila})`);
            return false; // Excluir esta fila
          }
          return true; // Incluir esta fila
        })
        .map((fila: any) => this.mapearFilaAPlanProduccion(fila));
  
      // 2. Si NO hay filas válidas, mostrar error y salir
      if (planesValidos.length === 0) {
        this._toastr.error('No hay filas válidas para enviar. Verifica el año y mes.', 'Error');
        return;
      }
  
      // 3. Si hay filas válidas, enviarlas al servidor
      this.enviarDatosAlServidor(planesValidos);
  
      // 4. Mostrar advertencia si hubo filas ignoradas
      if (errores.length > 0) {
        this._toastr.warning(
          `Se ignoraron ${errores.length} filas por año/mes incorrecto. Verifica la consola para detalles.`,
          'Advertencia',
          { closeButton: true, timeOut: 7000 }
        );
        console.warn('Filas ignoradas:', errores);
      }
    };
  
    reader.readAsArrayBuffer(archivo);
  }

  mapearFilaAPlanProduccion(fila: any): PlanProduccion {
    return {
      anio: fila["AÑO"],
      mes: fila['MES'],
      semana: fila['SEMANA'],
      mina: fila['MINA'],
      zona: fila['ZONA'],
      area: fila['AREA'],
      fase: fila['FASE'],
      minado_tipo: fila['MINADO/TIPO'],
      tipo_labor: fila['TIPO LABOR'],
      tipo_mineral: fila['TIPO DE MINERAL'],
      estructura_veta: fila['ESTRUCTURA/VETA'],
      nivel: fila['NIVEL'],
      block: fila['BLOCK'],
      labor: fila['LABOR'],
      ala: fila['ALA'],
      ancho_veta: fila['ANCHO DE VETA'],
      ancho_minado_sem: fila['ANCHO DE MINADO SEM'],
      ancho_minado_mes: fila['ANCHO DE MINADO MES'],
      ag_gr: fila['Ag gr'],
      porcentaje_cu: fila['%Cu'],
      porcentaje_pb: fila['%Pb'],
      porcentaje_zn: fila['%Zn'],
      vpt_act: fila['VPT ACT'],
      vpt_final: fila['VPT FINAL'],
      cut_off_1: fila['CUT OFF 1'],
      cut_off_2: fila['TONELAJE'],
      // Campos dinámicos 1A - 28B
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
  

  enviarDatosAlServidor(planes: PlanProduccion[]): void {
    this.mostrarPantallaCarga(); // Mostrar el diálogo de carga

    let enviados = 0;
    let errores = 0;

    planes.forEach((plan, index) => {
      this.planProduccionService.createPlanProduccion(plan).subscribe(
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

editarPlan(plan: PlanProduccion): void {

  const dialogRef = this.dialog.open(EditPlanProduccionComponent, {
    width: '450px',
    data: { ...plan } // Clonamos el objeto para evitar modificaciones antes de confirmar la API
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) { // Solo actualizamos si la API confirmó los cambios
      
      // Aquí puedes actualizar la lista localmente si es necesario
      this.obtenerUltimaFecha(); // Ejemplo: Recargar la lista de planes desde la API
    }
  });
}

  eliminarPlan(plan: any): void {
    if (confirm(`¿Está seguro de eliminar el plan del mes ${plan.mes}?`)) {
      
      // Llamar al servicio para eliminar el plan
    }
  }

  verPlan(plan: any): void {
    this.dialog.open(PlanProduccionDetallesDialogComponent, {
      width: '450px', // Ajusta el tamaño según necesites
      data: plan
    });
  }
  
}