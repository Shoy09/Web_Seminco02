import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service.service';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true, // Marca el componente como standalone
  imports: [FormsModule, CommonModule], // Importa los módulos necesarios
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  showPassword: boolean = false;
  codigo_dni: string = ''; 
  password: string = ''; 
  errorMessage: string = ''; // Para mostrar mensajes de error

  constructor(
    private readonly router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    if (!this.codigo_dni || !this.password) {
      this.errorMessage = 'Por favor, ingresa todos los campos.';
      return;
    }

    this.authService.login(this.codigo_dni, this.password).subscribe(
      (response) => {
        if (response.token) {
          this.authService.setToken(response.token); // Guarda el token en localStorage
          this.toastr.success('Inicio de sesión exitoso', 'Bienvenido');
          this.router.navigate(['/Dashboard']); // Redirige al dashboard
        } else {
          this.errorMessage = 'Error en la autenticación. Token no recibido.';
        }
      },
      (error) => {
        console.error('Error en el login', error);
        this.errorMessage = 'Credenciales incorrectas o problema con el servidor.';
      }
    );
  }
}