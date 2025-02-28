import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  // Palabra estatica para prueba
  title: string = "Ahorcado Angular"
  palabra: string = 'ANGULAR';
  palabraOculta: string[] = [];

  //Juego
  intentos: number = 0;
  letrasUsadas: Set<string> = new Set();
  maxIntentos: number = 6;

  abecedario: string[] = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

  // Variables para estado del juego
  gameOver: boolean = false;
  mensaje: string = '';

  constructor() {
    this.inicializarJuego();
  }

  inicializarJuego() {
    this.palabraOculta = Array(this.palabra.length).fill('_');
    this.intentos = 0;
    this.letrasUsadas.clear();
    this.gameOver = false;
    this.mensaje = '';
  }

  verificarLetra(letra: string) {
    // Si el juego terminó o la letra ya fue usada, no hacemos nada
    if (this.gameOver || this.letrasUsadas.has(letra)) return;

    // Marcamos la letra como usada
    this.letrasUsadas.add(letra);

    // Si la letra está en la palabra, actualizamos la palabra (puede tener mas de una ocurrencia)
    if (this.palabra.includes(letra)) {
      for (let i = 0; i < this.palabra.length; i++) {
        if (this.palabra[i] === letra) {
          this.palabraOculta[i] = letra;
        }
      }
    } else {
      // En caso de error aumentamos los intentos
      this.intentos++;
    }

    this.verificarEstadoJuego();
  }

  verificarEstadoJuego() {
    // Victoria: si ya no hay guiones bajos en palabraOculta
    if (!this.palabraOculta.includes('_')) {
      this.mensaje = '¡Ganaste!';
      this.gameOver = true;
    } else if (this.intentos >= this.maxIntentos) {
      // Derrota: se alcanzó el máximo de errores
      this.mensaje = '¡Perdiste! La palabra era: ' + this.palabra;
      this.gameOver = true;
    }
  }

  reiniciarJuego() {
    this.inicializarJuego();
  }

}
