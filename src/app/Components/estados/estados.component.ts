import { Component, OnInit, ViewChild } from '@angular/core';
import { Estado, Estado2 } from '../../models/Estado';
import { MatDialog } from '@angular/material/dialog';
import { EstadoService } from '../services/estado.service';
import { EstadoFormComponent } from '../estado-form/estado-form.component';
import { EstadoFormEditarComponent } from '../estado-form-editar/estado-form-editar.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { OpcionesDialogComponent } from '../opciones-dialog/opciones-dialog.component';
import { LoadingDialogComponent } from '../loading-dialog/loading-dialog.component';
import * as XLSX from 'xlsx';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-estados',
  imports: [ReactiveFormsModule, MatTableModule, MatPaginatorModule],
  templateUrl: './estados.component.html',
  styleUrl: './estados.component.css'
})
export class EstadosComponent implements OnInit {
  displayedColumns: string[] = ['estado_principal', 'codigo', 'tipo_estado', 'categoria', 'acciones'];
  dataSource = new MatTableDataSource<Estado>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private estadoService: EstadoService, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.getEstados();
  }

  getEstados(): void {
    this.estadoService.getEstados().subscribe(
      (data: Estado[]) => {
        this.dataSource.data = data;
  
        // Importante: Forzar actualización del paginador
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
          this.paginator.firstPage(); // Regresar a la primera página para evitar inconsistencias
        }
      },
      (error: any) => {
        console.error('Error al obtener los estados', error);
      }
    );
  }
  

  abrirDialogo() {
    const dialogRef = this.dialog.open(EstadoFormComponent, {
      width: '700px',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((nuevoEstado) => {
      if (nuevoEstado) {
        this.getEstados();
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  
  abrirDialogoEditar(estado: Estado) {
    const dialogRef = this.dialog.open(EstadoFormEditarComponent, {
      width: '700px',
      data: estado, // Pasamos el estado seleccionado
      autoFocus: false
    });
  
    dialogRef.afterClosed().subscribe((estadoEditado) => {
      if (estadoEditado) {
        this.getEstados(); // Volver a cargar los estados si hubo cambios
      }
    });
  }
  
  eliminarEstado(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { mensaje: '¿Estás seguro de que deseas eliminar este estado?' }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.estadoService.deleteEstado(id).subscribe(
          () => {
            this.getEstados(); // Refrescar la lista después de eliminar
          },
          (error) => {
            console.error('Error al eliminar el estado', error);
          }
        );
      }
    });
  }

  abrirDialogoOpciones() {
    const dialogRef = this.dialog.open(OpcionesDialogComponent, {
      width: '400px'
    });
  
    dialogRef.afterClosed().subscribe((opcion) => {
      if (opcion === 'estado') {
        this.abrirDialogo();
      } else if (opcion === 'excel') {
        this.abrirExploradorArchivos();
      }
    });
  }
  
  abrirExploradorArchivos() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xls, .xlsx';
    input.style.display = 'none';
  
    input.addEventListener('change', async (event: any) => {
      const archivo = event.target.files[0];
      if (archivo) {
        console.log('Archivo seleccionado:', archivo.name);
        this.procesarArchivoExcel(archivo);
      }
    });
  
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }
  
  async procesarArchivoExcel(archivo: File) {
    const reader = new FileReader();
  
    reader.onload = async (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
  
      const sheetName = 'ESTADOS';
      const worksheet = workbook.Sheets[sheetName];
  
      if (!worksheet) {
        console.error(`No se encontró la hoja llamada "${sheetName}"`);
        return;
      }
  
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
      // Omitimos la primera fila (encabezados) y procesamos las siguientes
      const estados: Estado2[] = jsonData.slice(1).map((fila) => ({
        estado_principal: fila[0] || '',
        codigo: fila[1] || '',
        tipo_estado: fila[2] || '',
        categoria: fila[3] || '',
      }));
  
      if (estados.length === 0) {
        console.warn('No hay estados para procesar.');
        return;
      }
  
      this.mostrarPantallaCarga();
      await this.enviarEstadosALaBD(estados);
      this.cerrarPantallaCarga();
    };
  
    reader.readAsArrayBuffer(archivo);
  }
  
  async enviarEstadosALaBD(estados: Estado2[]) {
    let estadosInsertados = 0;
  
    for (const estado of estados) {
      try {
        await this.estadoService.createEstado2(estado).toPromise();
        console.log(`Estado insertado: ${estado.estado_principal}`);
        estadosInsertados++;
      } catch (error) {
        console.error('Error al insertar estado:', estado.estado_principal, error);
      }
    }
  
    console.log(`Importación completada. Total de estados insertados: ${estadosInsertados}`);
    this.getEstados();

  }
  
  mostrarPantallaCarga() {
    this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
  }
  
  cerrarPantallaCarga() {
    this.dialog.closeAll();
  }
}