import { Component, OnInit } from '@angular/core';
import { HistoricoPartida } from '../models/historico-partida.model';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-historial',
  imports: [CommonModule],
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent implements OnInit {
  historicoPartidas: HistoricoPartida[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getHistorico().subscribe({
      next: (res) => {
        this.historicoPartidas = res.historico;
      },
      error: (err) => console.error('Error al obtener el historial', err)
    });
  }
}
