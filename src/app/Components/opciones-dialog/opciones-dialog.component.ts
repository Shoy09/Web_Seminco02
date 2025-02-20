import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-opciones-dialog',
  imports: [MatDialogModule, MatIconModule],
  templateUrl: './opciones-dialog.component.html',
  styleUrl: './opciones-dialog.component.css'
})
export class OpcionesDialogComponent {
  constructor(public dialogRef: MatDialogRef<OpcionesDialogComponent>) {}

  seleccionar(opcion: string) {
    this.dialogRef.close(opcion);
  }
}