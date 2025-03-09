import { Component, OnDestroy, OnInit } from '@angular/core';
import { Jugador } from '../models/jugador.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-juego',
  imports: [CommonModule, FormsModule],
  templateUrl: './juego.component.html',
  styleUrl: './juego.component.css'
})

export class JuegoComponent implements OnInit, OnDestroy {
  // Título del juego
  title: string = "Ahorcado Angular";

  // Palabras simuladas para cada jugador (en el futuro se asignarán aleatoriamente)
  palabraJugador1: string = 'ANGULAR';
  palabraJugador2: string = 'TYPESCRIPT';

  // Estados de cada jugador (se mantienen durante la partida)
  palabraOculta1: string[] = [];
  intentos1: number = 0;
  letrasUsadas1: Set<string> = new Set();
  timerJugador1: number = 0;
  intervaloJugador1: any = null;
  totalTime1: number = 0;
  rondasGanadas1: number = 0;

  palabraOculta2: string[] = [];
  intentos2: number = 0;
  letrasUsadas2: Set<string> = new Set();
  timerJugador2: number = 0;
  intervaloJugador2: any = null;
  totalTime2: number = 0;
  rondasGanadas2: number = 0;

  // Configuración general
  maxIntentos: number = 6;
  abecedario: string[] = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

  // Variables de configuración y turno
  setupComplete: boolean = false;
  jugador1!: Jugador;
  jugador2!: Jugador;
  nombreJugador1: string = '';
  nombreJugador2: string = '';
  turnoActual: number = 0; // 1 o 2
  gameOver: boolean = false;
  mensajeFinal: string = '';

  constructor() {}

  ngOnInit() {
    this.inicializarEstadoJugador1();
    this.inicializarEstadoJugador2();
  }

  ngOnDestroy() {
    this.limpiarIntervalos();
  }

  // Inicializa o reinicia el estado del jugador 2
  inicializarEstadoJugador1() {
    this.palabraOculta1 = Array(this.palabraJugador1.length).fill('_');
    this.letrasUsadas1.clear();
    this.timerJugador1 = 0;
  }

  // Inicializa o reinicia el estado del jugador 2
  inicializarEstadoJugador2() {
    this.palabraOculta2 = Array(this.palabraJugador2.length).fill('_');
    this.letrasUsadas2.clear();
    this.timerJugador2 = 0;
  }

  // Función para iniciar la partida: registramos jugadores y asignamos aleatoriamente el turno inicial.
  iniciarPartida() {
    if (this.nombreJugador1.trim() && this.nombreJugador2.trim()) {
      this.jugador1 = new Jugador(this.nombreJugador1.trim());
      this.jugador2 = new Jugador(this.nombreJugador2.trim());

      // acumuladores
      this.totalTime1 = 0;
      this.totalTime2 = 0;
      this.rondasGanadas1 = 0;
      this.rondasGanadas2 = 0;

      // Asignación aleatoria de turno inicial
      this.turnoActual = Math.random() < 0.5 ? 1 : 2;
      alert(`El jugador que inicia es: ${this.turnoActual === 1 ? this.jugador1.nombre : this.jugador2.nombre}`);
      this.setupComplete = true;
      this.iniciarCronometro();
    } else {
      alert('Por favor, ingrese ambos nombres.');
    }
  }

  // Verifica la letra ingresada en función del turno actual.
  verificarLetra(letra: string) {
    if (!this.setupComplete || this.gameOver) return;

    if (this.turnoActual === 1) {
      if (this.letrasUsadas1.has(letra)) return;
      this.letrasUsadas1.add(letra);

      if (this.palabraJugador1.includes(letra)) {
        for (let i = 0; i < this.palabraJugador1.length; i++) {
          if (this.palabraJugador1[i] === letra) {
            this.palabraOculta1[i] = letra;
          }
        }

        // Si la palabra se completa (ya no hay espacios) entonces es ronda ganada.
        if (!this.palabraOculta1.includes('_')) {
          this.rondasGanadas1++;
          this.finalizarTurno(1, true);
        }
      } else {
        
        // Error: se incrementa el contador de intentos y finaliza el turno
        this.intentos1++;
        this.finalizarTurno(1, false);
      }
    } else if (this.turnoActual === 2) {
      if (this.letrasUsadas2.has(letra)) return;
      this.letrasUsadas2.add(letra);

      if (this.palabraJugador2.includes(letra)) {
        for (let i = 0; i < this.palabraJugador2.length; i++) {
          if (this.palabraJugador2[i] === letra) {
            this.palabraOculta2[i] = letra;
          }
        }
        if (!this.palabraOculta2.includes('_')) {
          this.rondasGanadas2++;
          this.finalizarTurno(2, true);
        }
      } else {
        this.intentos2++;
        this.finalizarTurno(2, false);
      }
    }

    // Si alguno alcanza el máximo de errores, finaliza la partida.
    if (this.intentos1 >= this.maxIntentos || this.intentos2 >= this.maxIntentos) {
      this.finalizarPartida();
    }
  }

  /**
   * Finaliza el turno del jugador indicado.
   * @param jugador Número de jugador (1 o 2)
   * @param exito true o false depende si el jugador acertó la palabra
   *
   * - Si **exito** es true: Se reinicia el estado del jugador (nueva palabra).
   * - Si false: Se mantiene el estado actual (letras adivinadas y errores acumulados) para continuar en el siguiente turno.
   * En ambos casos se acumula el tiempo del turno finalizado y se cambia el turno.
   */
  finalizarTurno(jugador: number, exito: boolean) {
    this.detenerCronometro();
    if (jugador === 1) {
      this.totalTime1 += this.timerJugador1;

      // Si adivinó la palabra, se reinicia para nueva ronda
      if (exito) {
        this.inicializarEstadoJugador1();
      }
    } else {
      this.totalTime2 += this.timerJugador2;
      if (exito) {
        this.inicializarEstadoJugador2();
      }
    }
    this.cambiarTurno();
  }

  // Cambia el turno al otro jugador e inicia su cronómetro.
  cambiarTurno() {
    if (this.turnoActual === 1 && this.intentos2 < this.maxIntentos) {
      this.turnoActual = 2;
    } else if (this.turnoActual === 2 && this.intentos1 < this.maxIntentos) {
      this.turnoActual = 1;
    }
    if (this.intentos1 < this.maxIntentos && this.intentos2 < this.maxIntentos) {
      this.iniciarCronometro();
    } else {
      this.finalizarPartida();
    }
  }

  // Inicia el cronómetro para el jugador actual.
  iniciarCronometro() {
    if (this.turnoActual === 1 && this.intentos1 < this.maxIntentos) {
      this.intervaloJugador1 = setInterval(() => {
        this.timerJugador1++;
      }, 1000);
    } else if (this.turnoActual === 2 && this.intentos2 < this.maxIntentos) {
      this.intervaloJugador2 = setInterval(() => {
        this.timerJugador2++;
      }, 1000);
    }
  }

  // Detiene el cronómetro del jugador actual.
  detenerCronometro() {
    if (this.turnoActual === 1 && this.intervaloJugador1) {
      clearInterval(this.intervaloJugador1);
      this.intervaloJugador1 = null;
    } else if (this.turnoActual === 2 && this.intervaloJugador2) {
      clearInterval(this.intervaloJugador2);
      this.intervaloJugador2 = null;
    }
  }

  // Finaliza la partida y determina el ganador.
  finalizarPartida() {
    this.detenerCronometro();
    this.gameOver = true;
    // Si las rondas de un jugador es mayor a las del otro y el juego ha terminado gana el de mayor puntos.
    // En caso de empate, menor tiempo total gana
    if (this.rondasGanadas1 > this.rondasGanadas2) {
      this.mensajeFinal = `¡Ganó ${this.jugador1.nombre}!`;
    } else if (this.rondasGanadas2 > this.rondasGanadas1) {
      this.mensajeFinal = `¡Ganó ${this.jugador2.nombre}!`;
    } else {
      if (this.totalTime1 < this.totalTime2) {
        this.mensajeFinal = `Empate en rondas. Desempate: gana ${this.jugador1.nombre}`;
      } else if (this.totalTime2 < this.totalTime1) {
        this.mensajeFinal = `Empate en rondas. Desempate: gana ${this.jugador2.nombre}`;
      } else {
        this.mensajeFinal = '¡Empate total!';
      }
    }
  }

  // Reiniciar partida completa.
  reiniciarJuego() {
    this.detenerCronometro();
    this.setupComplete = false;
    this.gameOver = false;
    this.mensajeFinal = '';
    this.nombreJugador1 = '';
    this.nombreJugador2 = '';
    this.turnoActual = 0;
    this.intentos1 = 0;
    this.intentos2 = 0;
    this.totalTime1 = 0;
    this.totalTime2 = 0;
    this.rondasGanadas1 = 0;
    this.rondasGanadas2 = 0;
    this.inicializarEstadoJugador1();
    this.inicializarEstadoJugador2();
  }

  limpiarIntervalos() {
    if (this.intervaloJugador1) clearInterval(this.intervaloJugador1);
    if (this.intervaloJugador2) clearInterval(this.intervaloJugador2);
  }
}