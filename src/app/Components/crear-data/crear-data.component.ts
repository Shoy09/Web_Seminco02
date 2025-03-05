import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TipoPerforacionService } from '../../services/tipo-perforacion.service';
import { EquipoService } from '../../services/equipo.service';
import { EmpresaService } from '../../services/empresa.service';

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

  constructor(private TipoPerforacionService: TipoPerforacionService, private EquipoService: EquipoService,
    private EmpresaService: EmpresaService
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
  
    if (button.nombre === 'Tipo de Perforación') {
      this.obtenerTipoPerforacion();
    } else if (button.nombre === 'Equipo') {
      this.obtenerEquipos();
    } else if (button.nombre === 'Empresa') {
      this.obtenerEmpresas(); // Nueva función para obtener empresas
    }
  }
  obtenerEmpresas() {
    this.EmpresaService.getEmpresa().subscribe(
      (response) => {
        console.log('Empresas obtenidas:', response);
        this.modalContenido.datos = response.map((item) => item.nombre);
      },
      (error) => {
        console.error('Error al obtener empresas:', error);
      }
    );
  }

  obtenerEquipos() {
    this.EquipoService.getEquipos().subscribe(
      (response) => {
        console.log('Equipos obtenidos:', response);
        this.modalContenido.datos = response.map((item) => item.nombre);
      },
      (error) => {
        console.error('Error al obtener equipos:', error);
      }
    );
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
      const nuevoRegistro = { nombre: this.nuevoDato };
  
      if (this.modalContenido.nombre === 'Tipo de Perforación') {
        this.TipoPerforacionService.createTipoPerforacion(nuevoRegistro).subscribe(
          () => {
            this.nuevoDato = '';
            this.obtenerTipoPerforacion();
          },
          (error) => console.error('Error al guardar Tipo de Perforación:', error)
        );
      } else if (this.modalContenido.nombre === 'Equipo') {
        this.EquipoService.createEquipo(nuevoRegistro).subscribe(
          () => {
            this.nuevoDato = '';
            this.obtenerEquipos();
          },
          (error) => console.error('Error al guardar Equipo:', error)
        );
      } else if (this.modalContenido.nombre === 'Empresa') {
        this.guardarEmpresa(nuevoRegistro); // Nueva función para guardar empresa
      }
    }
  }
  guardarEmpresa(nuevaEmpresa: { nombre: string }) {
    this.EmpresaService.createEmpresa(nuevaEmpresa).subscribe(
      () => {
        this.nuevoDato = '';
        this.obtenerEmpresas();
      },
      (error) => console.error('Error al guardar Empresa:', error)
    );
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
