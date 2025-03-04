import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { PlanProduccion } from '../../models/plan_produccion.model';

@Component({
  selector: 'app-plan-produccion-detalles-dialog',
  imports: [CommonModule, MatDialogModule],
  templateUrl: './plan-produccion-detalles-dialog.component.html',
  styleUrls: ['./plan-produccion-detalles-dialog.component.css']
})
export class PlanProduccionDetallesDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<PlanProduccionDetallesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public plan: PlanProduccion
  ) {}

  cerrarDialogo(): void {
    this.dialogRef.close();
  }

  obtenerCamposDinamicos(): string[] {
    return Object.keys(this.plan).filter(
      key =>
        ![
          'id', 'mes', 'semana', 'mina', 'zona', 'area', 'fase', 'minado_tipo', 'tipo_labor',
          'tipo_mineral', 'estructura_veta', 'nivel', 'block', 'labor', 'ala',
          'ancho_veta', 'ancho_minado_sem', 'ancho_minado_mes', 'ag_gr', 'porcentaje_cu',
          'porcentaje_pb', 'porcentaje_zn', 'vpt_act', 'vpt_final', 'cut_off_1', 'cut_off_2'
        ].includes(key)
    );
  }
}
