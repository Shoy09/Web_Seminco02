import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-meta',
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog-meta.component.html',
  styleUrls: ['./dialog-meta.component.css']  // Corregir de styleUrl a styleUrls
})
export class DialogMetaComponent {
  nombre: string = '';
  objetivo: number = 0;

  constructor(
    public dialogRef: MatDialogRef<DialogMetaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mes: string; grafico: string }
  ) {}

  guardar() {
    // Al guardar, se cierra el dialog y envía los datos al componente padre
    this.dialogRef.close({
      mes: this.data.mes,
      grafico: this.data.grafico,
      nombre: this.nombre,
      objetivo: this.objetivo
    });
  }

  cancelar() {
    // Solo cierra el dialog sin hacer nada
    this.dialogRef.close();
  }
}
