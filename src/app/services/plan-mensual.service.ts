import { Injectable } from '@angular/core';
import { ApiService } from './api.service'; // Importamos ApiService
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { PlanMensual } from '../models/plan-mensual.model';

@Injectable({
  providedIn: 'root'
})
export class PlanMensualService {
  private baseUrl = 'PlamMensual'; // Asegúrate de que coincide con tu backend
  private planesActualizados = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getPlanesMensuales(): Observable<PlanMensual[]> {
    return this.apiService.getDatos(this.baseUrl);
  }

  getPlanMensualById(id: number): Observable<PlanMensual> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  createPlanMensual(planMensual: PlanMensual): Observable<PlanMensual> {
    return this.apiService.postDatos(`${this.baseUrl}/`, planMensual).pipe(
      tap(() => {
        this.planesActualizados.next(true); // Notificar que se creó un nuevo plan
      })
    );
  }

  updatePlanMensual(id: number, planMensual: PlanMensual): Observable<PlanMensual> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, planMensual);
  }

  deletePlanMensual(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`);
  }

  getPlanMensualActualizado(): Observable<boolean> {
    return this.planesActualizados.asObservable();
  }
}
