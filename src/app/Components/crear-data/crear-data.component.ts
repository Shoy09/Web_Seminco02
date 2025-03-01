import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TipoPerforacionService } from '../../services/tipo-perforacion.service';

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
  formularioActivo: string = 'botones';  
  years: number[] = []; 
  meses: string[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  datos = [
    { nombre: 'Reporte A', year: '2024', mes: 'Enero' },
    { nombre: 'Reporte B', year: '2024', mes: 'Enero' },
    { nombre: 'Reporte C', year: '2024', mes: 'Enero' }
  ];

  constructor(private TipoPerforacionService: TipoPerforacionService) {} // Inyecta el servicio

  ngOnInit() {
    this.generarAños();
  }

  generarAños() {
    const yearActual = new Date().getFullYear();
    for (let i = 2020; i <= yearActual; i++) {
      this.years.push(i);
    }
  }

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

  abrirModal(button: any) {
    this.modalAbierto = true;
    this.modalContenido = button;

    // Si se hace clic en "Tipo de Perforación", hacer la petición GET
    if (button.nombre === 'Tipo de Perforación') {
      this.obtenerTipoPerforacion();
    }
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.modalContenido = null;
  }

  guardarDatoss() {
    if (this.nuevoDato.trim()) {
      this.modalContenido.datos.push(this.nuevoDato);
      this.nuevoDato = '';
    }
  }

  guardarDatos() {
    if (this.nuevoDato.trim()) {
      const nuevoTipo = { nombre: this.nuevoDato };
      if (this.modalContenido.nombre === 'Tipo de Perforación') {
        this.TipoPerforacionService.createTipoPerforacion(nuevoTipo).subscribe(
          () => {
            this.nuevoDato = ''; // Limpiar input
            this.obtenerTipoPerforacion(); // Recargar lista desde la API
          },
          (error) => {
            console.error('Error al guardar el tipo de perforación:', error);
          }
        );
      }
    }
  }
  

  obtenerTipoPerforacion() {
    this.TipoPerforacionService.getTiposPerforacion().subscribe(
      (response) => {
        console.log('Datos obtenidos:', response);
        this.modalContenido.datos = response.map(item => item["nombre"]); // Acceso seguro a la propiedad
      },
      (error) => {
        console.error('Error al obtener datos:', error);
      }
    );
  }
  

descargar(item: any): void {}
eliminar(item: any): void {}

}
