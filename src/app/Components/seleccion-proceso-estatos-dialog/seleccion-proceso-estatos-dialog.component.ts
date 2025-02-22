import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { OpcionesDialogComponent } from '../opciones-dialog/opciones-dialog.component';

@Component({
  selector: 'app-seleccion-proceso-estatos-dialog',
  imports: [MatDialogModule, CommonModule, MatGridListModule, MatDividerModule ],
  templateUrl: './seleccion-proceso-estatos-dialog.component.html',
  styleUrl: './seleccion-proceso-estatos-dialog.component.css'
})
export class SeleccionProcesoEstatosDialogComponent {
  procesos = ['Perforacion taladro largo', 'Perforacion horizontal', 'Sostenimiento', 'Servicios auxiliares', 'Carguío', 'Acarreo'];

  constructor(
    public dialogRef: MatDialogRef<SeleccionProcesoEstatosDialogComponent>,
    private dialog: MatDialog // 🟢 Inyectamos MatDialog aquí
  ) {}

  seleccionarProceso(proceso: string) {
    this.abrirDialogo(proceso);

  }

  cerrarDialogo() {
    this.dialogRef.close();
  }
  
  abrirDialogo(proceso: string) {
    const dialogRef = this.dialog.open(OpcionesDialogComponent, {
      data: { proceso } // 🟢 Pasamos el proceso seleccionado
    });
  
    this.dialogRef.close(); // 🔴 Cerramos el diálogo actual después de abrir el nuevo
  }
  
}