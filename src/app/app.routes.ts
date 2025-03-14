import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';
import { PrincipalComponent } from './Components/principal/principal.component';
import { HomeComponent } from './Components/home/home.component';
import { EstadosComponent } from './Components/estados/estados.component';
import { UsuariosComponent } from './Components/usuarios/usuarios.component';
import { CrearDataComponent } from './Components/crear-data/crear-data.component';
import { PlanMensualListComponent } from './Components/plan-mensual-list/plan-mensual-list.component';
import { PlanMetrajeListComponent } from './Components/plan-metraje-list/plan-metraje-list.component';
import { PlanProduccionListComponent } from './Components/plan-produccion-list/plan-produccion-list.component';
import { ExplosivosComponent } from './Components/explosivos/explosivos.component';
import { UsuarioComponent } from './Components/usuario/usuario.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  {
    path: 'Dashboard',
    component: PrincipalComponent, // Layout principal con menú
    children: [
      { path: 'Home', component: HomeComponent },
      { path: 'estados', component: EstadosComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'crear-data', component: CrearDataComponent },
      { path: 'plan-mensual', component: PlanMensualListComponent },
      { path: 'plan-metraje', component: PlanMetrajeListComponent },
      { path: 'plan-produccion', component: PlanProduccionListComponent },
      { path: 'explosivos', component: ExplosivosComponent },
      { path: 'perfil', component: UsuarioComponent },
    ],
  },

  { path: '**', redirectTo: '/login' },
];
