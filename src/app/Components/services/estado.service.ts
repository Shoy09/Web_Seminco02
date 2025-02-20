import { Injectable } from '@angular/core';
import { ApiService } from './api.service'; // Importamos ApiService
import { Observable } from 'rxjs';
import { Estado, Estado2 } from '../../models/Estado';

@Injectable({
  providedIn: 'root'
})
export class EstadoService {
  private baseUrl = 'estado'; // Asegúrate de que coincide con tu backend

  constructor(private apiService: ApiService) {}

  getEstados(): Observable<Estado[]> {
    return this.apiService.getDatos(this.baseUrl);
  }

  getEstadoById(id: number): Observable<Estado> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  createEstado(estado: Estado): Observable<Estado> {
    return this.apiService.postDatos(`${this.baseUrl}/`, estado);
  }
  createEstado2(estado: Estado2): Observable<Estado> {
    return this.apiService.postDatos(`${this.baseUrl}/`, estado);
  }
  

  updateEstado(id: number, estado: Estado): Observable<Estado> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, estado);
  }

  deleteEstado(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`);
  }
}
