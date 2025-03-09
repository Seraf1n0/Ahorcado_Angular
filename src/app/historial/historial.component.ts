import { Component, OnInit } from '@angular/core';
import { HistoricoPartida } from '../models/historico-partida.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-historial',
  imports: [CommonModule],
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent implements OnInit {
  historicoPartidas: HistoricoPartida[] = [];

  ngOnInit(): void {
    // Datos de prueba estáticos; en el futuro se cargarán de un JSON o API
    this.historicoPartidas = [
      new HistoricoPartida('Serafino', 'Manolo', 'Victoria', 'Manolo'),
      new HistoricoPartida('ElChavo', 'Bryan', 'Victoria', 'ElChavo'),
      new HistoricoPartida('Edutec', 'Dylantero', 'Empate', null)
    ];
  }
}
