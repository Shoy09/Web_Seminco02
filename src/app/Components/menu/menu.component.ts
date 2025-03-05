import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent { 
  menus = [
    {title: 'Home', icon: 'home.svg' },
    { title: 'Dashboard', icon: 'das.svg', subItems: ['Perforación Horizontal', 'explosivos','Servicios Auxiliares','Sostenimiento','Mediciones','Aceros de Perforación','Acerreo','Carguio','Perforación de Taladros Largos'] },
    { title: 'Carga de Datos', icon: 'data.svg', subItems: ['estados', 'crear-data' , 'plan-mensual', 'plan-metraje', 'plan-produccion', 'Perforación Horizontal', 'Explosivos','Servicios Auxiliares','Sostenimiento','Mediciones','Aceros de Perforación','Acerreo','Carguio','Perforación de Taladros Largos'] },
    { title: 'Roles', icon: 'rol.svg', subItems: ['usuarios', 'Subopción B'] },
  ];

  menuOpenIndex: number | null = null;
  selectedSubItemIndex: number | null = null;
  selectedSubItem: string | null = null;

  constructor(private router: Router) { 
    // Si no hay ninguna ruta activa, redirige a Home
    if (this.router.url === '/' || this.router.url === '/Dashboard') {
      this.router.navigate(['/Dashboard/Home']);
    }
  }
  

  AbrirCerrar(index: number, menu: any) {
    if (menu.title === 'Home') {
      this.router.navigate(['/Dashboard/Home']); // Redirige directamente
    } else {
      this.menuOpenIndex = this.menuOpenIndex === index ? null : index;
    }
  }
  

  selectSubItem(index: number, subItem: string) {
    this.selectedSubItemIndex = index;
    this.selectedSubItem = subItem;

    // 🔹 Navegación automática al hacer clic en la subopción
    const ruta = `/Dashboard/${this.convertirRuta(subItem)}`;
    this.router.navigate([ruta]);
  }

  convertirRuta(subItem: string): string {
    return subItem.toLowerCase().replace(/ /g, '-'); // Convierte espacios a guiones
  }
}
