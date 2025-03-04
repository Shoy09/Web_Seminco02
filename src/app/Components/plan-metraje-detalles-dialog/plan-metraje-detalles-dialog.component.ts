import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { PlanMetraje } from '../../models/plan_metraje.model';

@Component({
  selector: 'app-plan-metraje-detalles-dialog',
  imports: [CommonModule, MatDialogModule],
  templateUrl: './plan-metraje-detalles-dialog.component.html',
  styleUrls: ['./plan-metraje-detalles-dialog.component.css']
})
export class PlanMetrajeDetallesDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<PlanMetrajeDetallesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public plan: PlanMetraje
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
          'ancho_veta', 'ancho_minado_sem', 'ancho_minado_mes', 'burden', 'espaciamiento', 'longitud_perforacion'
        ].includes(key)
    );
  }
}
