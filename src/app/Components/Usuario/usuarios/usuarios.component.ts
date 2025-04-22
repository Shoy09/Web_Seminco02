import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UsuarioDialogComponent } from '../usuario-dialog/usuario-dialog.component';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import * as XLSX from 'xlsx';
import { Usuario } from '../../../models/Usuario';
import { UsuarioService } from '../../../services/usuario.service';
import { LoadingDialogComponent } from '../../Reutilizables/loading-dialog/loading-dialog.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule, 
    MatFormFieldModule
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  displayedColumns: string[] = ['codigo_dni', 'nombre', 'correo', 'acciones'];
  dataSource = new MatTableDataSource<Usuario>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private usuarioService: UsuarioService, public dialog: MatDialog) {}

  ngOnInit() {
    this.obtenerUsuarios();
  }

  obtenerUsuarios() {
    this.usuarioService.obtenerUsuarios().subscribe((data) => {
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  } 

  abrirDialogoCrear() {
    const dialogRef = this.dialog.open(UsuarioDialogComponent, {
      width: '400px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerUsuarios();
      }
    });
  }

  abrirDialogoEditar(usuario: Usuario) {
    const dialogRef = this.dialog.open(UsuarioDialogComponent, {
      width: '400px',
      data: usuario
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerUsuarios();
      }
    });
  }

  eliminarUsuario(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.usuarioService.eliminarUsuario(id).subscribe(() => {
        this.obtenerUsuarios();
      });
    }
  }

  aplicarFiltro(event: Event) {
    const valorFiltro = (event.target as HTMLInputElement).value;
    this.dataSource.filter = valorFiltro.trim().toLowerCase();
  }

  seleccionarArchivo() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    } else {
      // console.error("No se encontró el elemento de entrada de archivo.");
    }
  }
  

  cargarArchivo(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];
  
      // Leer archivo Excel
      const reader = new FileReader();
      reader.readAsArrayBuffer(archivo);
  
      reader.onload = () => {
        const data = new Uint8Array(reader.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
  
        // Buscar hoja "Usuarios"
        const sheetName = "Usuarios";
        const sheet = workbook.Sheets[sheetName];
  
        if (!sheet) {
          // console.error("No se encontró la hoja 'Usuarios' en el archivo.");
          return;
        }
  
        // Convertir hoja a JSON
        const datosExcel: any[] = XLSX.utils.sheet_to_json(sheet);
        // 
  
        let usuariosValidos: Usuario[] = [];
        let usuariosInvalidos: { nombre: string, dni: string }[] = [];
  
        // Validar datos antes de mapearlos
        datosExcel.forEach(row => {
          const apellidos = row["APELLIDOS"];
          const nombres = row["NOMBRES"];
          const codigo_dni = row["DNI"];
          const cargo = row["PUESTO ACTUAL QUE DESEMPEÑA"];
          const rol = row["ROL"] || 'Trabajador'; 
          const area = row["ÁREA"];
          const clasificacion = row["CLASIFICACIÓN"];
          const password = row["password"];  
  
          // Verificar si falta algún campo obligatorio
          if (!apellidos || !nombres || !codigo_dni || !cargo || !area || !rol || !clasificacion || !password) {
            usuariosInvalidos.push({ 
              nombre: nombres || "Desconocido", 
              dni: codigo_dni || "Sin DNI" 
            });
          } else {
            usuariosValidos.push({
              apellidos,
              nombres,
              codigo_dni,
              cargo,
              area,
              rol,
              clasificacion,
              password
            });
          }
        });
  
        // 
        // 
  
        if (usuariosValidos.length > 0) {
          this.mostrarPantallaCarga();
          this.enviarUsuarios(usuariosValidos, usuariosInvalidos);
        } else {
          alert("No hay usuarios válidos para enviar.");
        }
      };
    }
  }

  mostrarPantallaCarga() {
    this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
  }

  enviarUsuarios(usuarios: Usuario[], usuariosInvalidos: { nombre: string, dni: string }[]) {
    let totalUsuarios = usuarios.length;
    let usuariosProcesados = 0;
  
    const dialogRef = this.dialog.open(LoadingDialogComponent, { disableClose: true });
  
    usuarios.forEach(usuario => {
      this.usuarioService.crearUsuario(usuario).subscribe({
        next: (response) => {
          // 
          usuariosProcesados++;
  
          if (usuariosProcesados === totalUsuarios) {
            dialogRef.close();
            this.mostrarErrores(usuariosInvalidos);
          }
        },
        error: (error) => {
          // console.error("Error al crear usuario:", error);
          usuariosProcesados++;
  
          if (usuariosProcesados === totalUsuarios) {
            dialogRef.close();
            this.mostrarErrores(usuariosInvalidos);
          }
        }
      });
    });
  }

  mostrarErrores(usuariosInvalidos: { nombre: string, dni: string, motivo?: string }[]) {
    if (usuariosInvalidos.length > 0) {
      let mensaje = "Errores en el registro:\n\n";
      usuariosInvalidos.forEach(usuario => {
        mensaje += `• ${usuario.nombre} (DNI: ${usuario.dni}): ${usuario.motivo || 'Datos incompletos'}\n`;
      });
      alert(mensaje);
    }
  }

  
}

