import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent {
  constructor(private router: Router) {}

  // Funciones para navegación a ambas partes del juego
  jugar() {
    this.router.navigate(['/juego']);
  }

  verHistorial() {
    this.router.navigate(['/historial']);
  }
}
