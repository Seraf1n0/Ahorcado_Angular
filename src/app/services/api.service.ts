import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoricoPartida } from '../models/historico-partida.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // URL base
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene una palabra aleatoria.
   * @returns Observable con un objeto que contiene la propiedad 'palabra'
   */
  getPalabra(): Observable<{ palabra: string }> {
    return this.http.get<{ palabra: string }>(`${this.baseUrl}/palabra`);
  }

  /**
   * Envía una partida al historial.
   * @param partida Objeto de tipo HistoricoPartida que se enviará como body.
   * @returns Observable con la respuesta del API.
   */
  postHistorico(partida: HistoricoPartida): Observable<any> {
    return this.http.post(`${this.baseUrl}/historico`, partida);
  }

  /**
   * Obtiene el historial entero de las partidas.
   * @returns Observable con un objeto que contiene la propiedad 'historico' (lista de HistoricoPartida)
   */
  getHistorico(): Observable<{ historico: HistoricoPartida[] }> {
    return this.http.get<{ historico: HistoricoPartida[] }>(`${this.baseUrl}/historico`);
  }
}
