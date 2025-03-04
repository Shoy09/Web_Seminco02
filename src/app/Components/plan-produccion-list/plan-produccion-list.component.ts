import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PlanProduccion } from '../../models/plan_produccion.model';
import { PlanProduccionService } from '../../services/plan-produccion.service';
import { LoadingDialogComponent } from '../loading-dialog/loading-dialog.component';
import * as XLSX from 'xlsx';
import { PlanProduccionDetallesDialogComponent } from '../plan-produccion-detalles-dialog/plan-produccion-detalles-dialog.component';

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

  constructor(
    private planProduccionService: PlanProduccionService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.obtenerPlanesProduccion();
  }

  obtenerPlanesProduccion(): void {
    this.planProduccionService.getPlanesProduccion().subscribe((planes) => {
      this.dataSource.data = planes;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  aplicarFiltro(event: Event): void {
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
      const sheetName = 'PLAN PRODUCCIÓN'; // Nombre específico de la hoja
      const sheet = workbook.Sheets[sheetName];

      if (!sheet) {
        console.error(`La hoja "${sheetName}" no existe en el archivo.`);
        return;
      }

      // Convertimos los datos en formato JSON
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

      // Convertir datos a modelo PlanProduccion
      const planes: PlanProduccion[] = jsonData.map((fila: any) => this.mapearFilaAPlanProduccion(fila));

      // Enviar los datos al backend
      this.enviarDatosAlServidor(planes);
    };

    reader.readAsArrayBuffer(archivo);
  }

  mapearFilaAPlanProduccion(fila: any): PlanProduccion {
    return {
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
      cut_off_2: fila['CUT OFF 2'],
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
      this.obtenerPlanesProduccion(); // Recargar la tabla con los nuevos datos
    }
  }

  mostrarPantallaCarga() {
    this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
  }

  editarPlan(plan: any): void {
    console.log('Editar plan:', plan);
    // Aquí puedes abrir un diálogo o navegar a una pantalla de edición
  }

  eliminarPlan(plan: any): void {
    if (confirm(`¿Está seguro de eliminar el plan del mes ${plan.mes}?`)) {
      console.log('Eliminar plan:', plan);
      // Llamar al servicio para eliminar el plan
    }
  }

  verPlan(plan: any): void {
    this.dialog.open(PlanProduccionDetallesDialogComponent, {
      width: '400px', // Ajusta el tamaño según necesites
      data: plan
    });
  }
  
}