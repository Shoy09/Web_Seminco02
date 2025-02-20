import { Component, Inject } from '@angular/core';
import { Estado } from '../../models/Estado';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EstadoService } from '../services/estado.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-estado-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './estado-form.component.html',
  styleUrl: './estado-form.component.css'
})
export class EstadoFormComponent {
  estadoForm: FormGroup;
  mensaje: string = '';

  constructor(
    private fb: FormBuilder,
    private estadoService: EstadoService,
    public dialogRef: MatDialogRef<EstadoFormComponent>, // Referencia del diálogo
    @Inject(MAT_DIALOG_DATA) public data: any // Datos que puedes recibir al abrir el diálogo
  ) {
    this.estadoForm = this.fb.group({
      estado_principal: ['', Validators.required],
      codigo: ['', Validators.required],
      tipo_estado: ['', Validators.required],
      categoria: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.estadoForm.valid) {
      const nuevoEstado: Estado = this.estadoForm.value;

      this.estadoService.createEstado(nuevoEstado).subscribe({
        next: (response) => {
          this.mensaje = 'Estado creado exitosamente!';
          this.estadoForm.reset();
          this.dialogRef.close(response); // Cierra el diálogo y devuelve el estado creado
        },
        error: (error) => {
          console.error('Error al crear el estado:', error);
          this.mensaje = 'Ocurrió un error al crear el estado.';
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(); // Cierra el diálogo sin hacer nada
  }
}
