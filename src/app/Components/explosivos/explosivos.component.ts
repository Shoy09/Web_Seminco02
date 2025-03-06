import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExplosivoService } from '../../services/explosivo.service';
import { AccesorioService } from '../../services/accesorio.service';

@Component({
  selector: 'app-explosivos',
  imports: [FormsModule, CommonModule],
  templateUrl: './explosivos.component.html',
  styleUrl: './explosivos.component.css'
})
export class ExplosivosComponent implements OnInit {
  modalAbierto = false;
  modalContenido: any = null;
  nuevoDato: any = {}
  formularioActivo: string = 'botones';  
  years: number[] = []; 
  meses: string[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  datos = [
    { nombre: 'Reporte A', year: '2024', mes: 'Enero' },
    { nombre: 'Reporte B', year: '2024', mes: 'Enero' },
    { nombre: 'Reporte C', year: '2024', mes: 'Enero' }
  ];

  constructor(
    private explosivoService: ExplosivoService,
    private accesorioService: AccesorioService
  ) {} // Inyecta el servicio

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
    {
      nombre: 'Explosivos',
      icon: 'mas.svg',
      tipo: 'explosivo',
      datos: [],
      campos: [
        { nombre: 'tipo_explosivo', label: 'Tipo de Explosivo', tipo: 'text' },
        { nombre: 'cantidad_por_caja', label: 'Cantidad por Caja', tipo: 'number' },
        { nombre: 'peso_unitario', label: 'Peso Unitario', tipo: 'number' },
        { nombre: 'costo_por_kg', label: 'Costo por KG', tipo: 'number' },
      ]
    },
    {
      nombre: 'Accesorios',
      icon: 'mas.svg',
      tipo: 'accesorio',
      datos: [],
      campos: [
        { nombre: 'tipo_accesorio', label: 'Tipo de Accesorio', tipo: 'text' },
        { nombre: 'costo', label: 'Costo', tipo: 'number' },
      ]
    }
  ];
  

  abrirModal(button: any) {
    this.modalAbierto = true;
    this.modalContenido = button;
  
    if (button.tipo === 'explosivo') {
      this.explosivoService.getExplosivos().subscribe({
        next: (data) => {
          this.modalContenido.datos = data; // Asigna los datos recibidos
          console.log('Explosivos cargados:', data);
        },
        error: (err) => console.error('Error al cargar explosivos:', err)
      });
    } else if (button.tipo === 'accesorio') {
      this.accesorioService.getAccesorios().subscribe({
        next: (data) => {
          this.modalContenido.datos = data; // Asigna los datos recibidos
          console.log('Accesorios cargados:', data);
        },
        error: (err) => console.error('Error al cargar accesorios:', err)
      });
    }
  }
  

  cerrarModal() {
    this.modalAbierto = false;
    this.modalContenido = null;
  }

  guardarDatos() {
    if (Object.values(this.nuevoDato).some(val => val !== '')) {
      const nuevoRegistro = { ...this.nuevoDato };

      if (this.modalContenido.tipo === 'explosivo') {
        this.explosivoService.createExplosivo(nuevoRegistro).subscribe({
          next: (data) => {
            this.modalContenido.datos.push(data);
            console.log('Explosivo guardado:', data);
          },
          error: (err) => console.error('Error al guardar explosivo:', err)
        });
      } else if (this.modalContenido.tipo === 'accesorio') {
        this.accesorioService.createAccesorio(nuevoRegistro).subscribe({
          next: (data) => {
            this.modalContenido.datos.push(data);
            console.log('Accesorio guardado:', data);
          },
          error: (err) => console.error('Error al guardar accesorio:', err)
        });
      }

      this.nuevoDato = {};
    }
  }

  eliminar(item: any): void {
    if (!item || !this.modalContenido) return;
  
    if (this.modalContenido.tipo === 'explosivo') {
      this.explosivoService.deleteExplosivo(item.id).subscribe({
        next: () => {
          this.modalContenido.datos = this.modalContenido.datos.filter((dato: any) => dato.id !== item.id);
          console.log('Explosivo eliminado:', item);
        },
        error: (err) => console.error('Error al eliminar explosivo:', err)
      });
    } else if (this.modalContenido.tipo === 'accesorio') {
      this.accesorioService.deleteAccesorio(item.id).subscribe({
        next: () => {
          this.modalContenido.datos = this.modalContenido.datos.filter((dato: any) => dato.id !== item.id);
          console.log('Accesorio eliminado:', item);
        },
        error: (err) => console.error('Error al eliminar accesorio:', err)
      });
    }
  }
  
  

descargar(item: any): void {}

}
