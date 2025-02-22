import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-crear-data',
  imports: [FormsModule, CommonModule],
  templateUrl: './crear-data.component.html',
  styleUrl: './crear-data.component.css'
})
export class CrearDataComponent implements OnInit {
  modalAbierto = false;
  modalContenido: any = null;
  nuevoDato: string = '';
// Datos para el contenido
formularioActivo: string = 'botones';  
years: number[] = []; 
meses: string[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
// Datos ficticios para la tabla
datos = [
  { nombre: 'Reporte A', year: '2024', mes: 'Enero' },
  { nombre: 'Reporte B', year: '2024', mes: 'Enero' },
  { nombre: 'Reporte C', year: '2024', mes: 'Enero' }
];
ngOnInit() {
  this.generarAños(); // Llamamos a la función cuando el componente se inicializa
}

generarAños() {
  const yearActual = new Date().getFullYear(); // Obtiene el año actual (ejemplo: 2024)
  for (let i = 2020; i <= yearActual; i++) { // Genera años desde 2020 hasta el año actual
    this.years.push(i);
  }
}

// Método para mostrar el formulario
mostrarFormulario(formulario: string): void {
  this.formularioActivo = formulario;
}


buttonc = [
  { nombre: 'Zona ', icon: 'mas.svg', datos: [] },
  { nombre: 'Mina', icon: 'mas.svg' , datos: []},
  { nombre: 'Estructura', icon: 'mas.svg', datos: [] },
  { nombre: 'Material', icon: 'mas.svg', datos: [] },
  { nombre: 'Turno', icon: 'mas.svg' , datos: []},
  { nombre: 'Equipo', icon: 'mas.svg' , datos: []},
  { nombre: 'Empresa', icon: 'mas.svg' , datos: []},
  { nombre: 'Diametro', icon: 'mas.svg', datos: [] }, 
  { nombre: 'Tipo de Perforación', icon: 'mas.svg' , datos: []},
  { nombre: 'Estados', icon: 'mas.svg' , datos: []},
];

descargar(item: any): void {}
eliminar(item: any): void {}

abrirModal(button: any) {
  this.modalAbierto = true;
  this.modalContenido = button;
}

cerrarModal() {
  this.modalAbierto = false;
  this.modalContenido = null;
}

guardarDatos() {
  if (this.nuevoDato.trim()) {
    this.modalContenido.datos.push(this.nuevoDato);
    this.nuevoDato = '';
  }
}
}
