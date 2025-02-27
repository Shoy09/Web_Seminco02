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

  constructor(private planMensualService: PlanMensualService, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.obtenerPlanesMensuales();
  }

  obtenerPlanesMensuales(): void {
    this.planMensualService.getPlanesMensuales().subscribe((planes) => {
      this.dataSource.data = planes;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
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
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
  
      // Convertimos los datos en formato JSON
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);
  
      const totalFilas = jsonData.length; // Contar filas del archivo
  
      // Convertir datos a modelo PlanMensual
      const planes: PlanMensual[] = jsonData.map((fila: any) => this.mapearFilaAPlanMensual(fila));
  
  
      // Enviar los datos al backend
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
          `col_${i + 1}A`, fila[`${i + 1}A`] || null
        ])
      ),
      ...Object.fromEntries(
        Array.from({ length: 28 }, (_, i) => [
          `col_${i + 1}B`, fila[`${i + 1}B`] || null
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
      this.obtenerPlanesMensuales(); // Recargar la tabla con los nuevos datos
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