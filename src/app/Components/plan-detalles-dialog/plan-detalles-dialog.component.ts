import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PlanMensual } from '../../models/plan-mensual.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plan-detalles-dialog',
  imports: [MatDialogModule, CommonModule],
  templateUrl: './plan-detalles-dialog.component.html',
  styleUrl: './plan-detalles-dialog.component.css'
})
export class PlanDetallesDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<PlanDetallesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public plan: PlanMensual
  ) {}

  cerrarDialogo(): void {
    this.dialogRef.close();
  }

  obtenerCamposDinamicos(): string[] {
    return Object.keys(this.plan).filter(
      key =>
        ![
          'id', 'anio', 'mes', 'minado_tipo', 'empresa', 'zona', 'area',
          'tipo_mineral', 'fase', 'estructura_veta', 'nivel', 'tipo_labor',
          'labor', 'ala', 'avance_m', 'ancho_m', 'alto_m', 'tms', 'programado'
        ].includes(key)
    );
  }
}