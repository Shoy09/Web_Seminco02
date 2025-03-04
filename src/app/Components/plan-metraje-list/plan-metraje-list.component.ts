import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import * as XLSX from 'xlsx';
import { MatDialog } from '@angular/material/dialog';
import { PlanMetraje } from '../../models/plan_metraje.model';
import { PlanMetrajeService } from '../../services/plan-metraje.service';
import { LoadingDialogComponent } from '../loading-dialog/loading-dialog.component';
import { PlanMetrajeDetallesDialogComponent } from '../plan-metraje-detalles-dialog/plan-metraje-detalles-dialog.component';

@Component({
  selector: 'app-plan-metraje-list',
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
  templateUrl: './plan-metraje-list.component.html',
  styleUrls: ['./plan-metraje-list.component.css']
})
export class PlanMetrajeListComponent implements OnInit {
  displayedColumns: string[] = [
    'mes', 'semana', 'mina', 'zona',
    'tipo_mineral', 'labor', 'acciones'
  ];
  dataSource = new MatTableDataSource<PlanMetraje>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private planMetrajeService: PlanMetrajeService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.obtenerPlanesMetraje();
  }

  obtenerPlanesMetraje(): void {
    this.planMetrajeService.getPlanesMetrajes().subscribe((planes) => {  // Asegúrate de usar el método correcto 'getPlanesMetrajes'
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
      const sheetName = 'PLAN METRAJE TL'; // Nombre específico de la hoja
      const sheet = workbook.Sheets[sheetName];

      if (!sheet) {
        console.error(`La hoja "${sheetName}" no existe en el archivo.`);
        return;
      }

      // Convertimos los datos en formato JSON
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

      const totalFilas = jsonData.length; // Contar filas del archivo

      // Convertir datos a modelo PlanMetraje
      const planes: PlanMetraje[] = jsonData.map((fila: any) => this.mapearFilaAPlanMetraje(fila));

      // Enviar los datos al backend
      this.enviarDatosAlServidor(planes);
    };

    reader.readAsArrayBuffer(archivo);
  }

  mapearFilaAPlanMetraje(fila: any): PlanMetraje {
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
      ancho_veta: fila['ANCHO DE VETA (m)'], // Revisa que este nombre coincida
      ancho_minado_sem: fila['ANCHO DE MINADO SEM (m)'], // Revisa que este nombre coincida
      ancho_minado_mes: fila['ANCHO DE MINADO MES (m)'], // Revisa que este nombre coincida
      burden: fila['BURDEN (m)'], // Revisa que este nombre coincida
      espaciamiento: fila['ESPACIAMIENTO (m)'], // Revisa que este nombre coincida
      longitud_perforacion: fila['LONGITUD DE PERFORACIÓN (m)'], // Revisa que este nombre coincida
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
  

  enviarDatosAlServidor(planes: PlanMetraje[]): void {
    this.mostrarPantallaCarga(); // Mostrar el diálogo de carga

    let enviados = 0;
    let errores = 0;

    planes.forEach((plan, index) => {
      this.planMetrajeService.createPlanMetraje(plan).subscribe(
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
      this.obtenerPlanesMetraje(); // Recargar la tabla con los nuevos datos
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
    this.dialog.open(PlanMetrajeDetallesDialogComponent, {
      width: '400px', // Ajusta el tamaño según necesites
      data: plan
    });
  }
}
