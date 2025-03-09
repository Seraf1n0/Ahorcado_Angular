import { Component, OnDestroy, OnInit } from '@angular/core';
import { Jugador } from '../models/jugador.model';
import { HistoricoPartida } from '../models/historico-partida.model';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-juego',
  imports: [CommonModule, FormsModule],
  templateUrl: './juego.component.html',
  styleUrls: ['./juego.component.css']
})
export class JuegoComponent implements OnInit, OnDestroy {
  // Título
  titulo: string = "Ahorcado Serafino";

  // Palabras para cada jugador (se obtienen del API)
  palabraJugador1: string = '';
  palabraJugador2: string = '';

  // Estados del Jugador 1
  palabraOculta1: string[] = [];
  intentos1: number = 0;
  letrasUsadas1: Set<string> = new Set();
  cronometroJugador1: number = 0; // Cronómetro del turno (sólo se muestra mas no es usado para desempate)
  intervaloJugador1: any = null;
  tiempoTotal1: number = 0; // Tiempo total acumulado (para desempate secundario)
  rondasGanadas1: number = 0;

  // Estados del Jugador 2
  palabraOculta2: string[] = [];
  intentos2: number = 0;
  letrasUsadas2: Set<string> = new Set();
  cronometroJugador2: number = 0;
  intervaloJugador2: any = null;
  tiempoTotal2: number = 0;
  rondasGanadas2: number = 0;

  // Tiempo efectivo: se mide solo mientras el jugador acierta
  tiempoEfectivo1: number = 0;
  tiempoEfectivo2: number = 0;
  inicioTiempoEfectivo1: number | null = null;
  inicioTiempoEfectivo2: number | null = null;

  // Configuración general
  maxIntentos: number = 6;
  abecedario: string[] = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

  // Variables de configuración y turno
  configurado: boolean = false;
  jugador1!: Jugador;
  jugador2!: Jugador;
  nombreJugador1: string = '';
  nombreJugador2: string = '';
  turnoActual: number = 0; // 1 o 2 solamente
  finDelJuego: boolean = false;
  mensajeFinal: string = '';

  // Variables para controlar las rondas (2)
  rondaActual: number = 1;

  // Flags de rondas para cada jugador
  rondaTerminada1: boolean = false;
  rondaTerminada2: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.reiniciarEstadoJugador1();
    this.reiniciarEstadoJugador2();
  }

  ngOnDestroy() {
    this.limpiarIntervalos();
  }

  // Metodo para obtener las palabras de los jugadroes accediendo al apiService
  obtenerPalabraJugador1(): void {
    this.apiService.getPalabra().subscribe({
      next: (res) => {
        this.palabraJugador1 = res.palabra;
        this.palabraOculta1 = Array(this.palabraJugador1.length).fill('_');
      },
      error: (err) => console.error('Error al obtener palabra para jugador 1:', err)
    });
  }

  obtenerPalabraJugador2(): void {
    this.apiService.getPalabra().subscribe({
      next: (res) => {
        this.palabraJugador2 = res.palabra;
        this.palabraOculta2 = Array(this.palabraJugador2.length).fill('_');
      },
      error: (err) => console.error('Error al obtener palabra para jugador 2:', err)
    });
  }

  // En caso de reinicio de ronda o estado
  reiniciarEstadoJugador1(): void {
    this.obtenerPalabraJugador1();
    this.letrasUsadas1.clear();
    this.cronometroJugador1 = 0;
    this.inicioTiempoEfectivo1 = null;
  }

  reiniciarEstadoJugador2(): void {
    this.obtenerPalabraJugador2();
    this.letrasUsadas2.clear();
    this.cronometroJugador2 = 0;
    this.inicioTiempoEfectivo2 = null;
  }

  // Inicio y flujo general de la paertida 
  iniciarPartida(): void {
    if (this.nombreJugador1.trim() && this.nombreJugador2.trim()) {
      this.jugador1 = new Jugador(this.nombreJugador1.trim());
      this.jugador2 = new Jugador(this.nombreJugador2.trim());

      // Acumuladores
      this.tiempoTotal1 = 0;
      this.tiempoTotal2 = 0;
      this.rondasGanadas1 = 0;
      this.rondasGanadas2 = 0;
      this.intentos1 = 0;
      this.intentos2 = 0;
      this.tiempoEfectivo1 = 0;
      this.tiempoEfectivo2 = 0;
      this.rondaActual = 1;
      this.rondaTerminada1 = false;
      this.rondaTerminada2 = false;

      // Asignar jugador 1 de forma aleatoria. (jugador 1 será el que juegue de primero)
      this.turnoActual = Math.random() < 0.5 ? 1 : 2;
      alert(`El jugador que inicia es: ${this.turnoActual === 1 ? this.jugador1.nombre : this.jugador2.nombre}`);

      this.configurado = true;
      // Obtener palabras iniciales
      this.obtenerPalabraJugador1();
      this.obtenerPalabraJugador2();
      this.iniciarCronometro();
    } else {
      alert('Por favor, ingrese ambos nombres.');
    }
  }

  // Verifica si la letra es correcta además de verificar si debe de acabar la ronda
  verificarLetra(letra: string): void {
    if (!this.configurado || this.finDelJuego) return;

    const ahora = Date.now();

    if (this.turnoActual === 1 && !this.rondaTerminada1) {
      if (this.letrasUsadas1.has(letra)) return;
      this.letrasUsadas1.add(letra);

      if (this.palabraJugador1.includes(letra)) {

        // El tiempo efectivo se inicia o acumila
        if (this.inicioTiempoEfectivo1 === null) {
          this.inicioTiempoEfectivo1 = ahora;
        } else {
          const diff = (ahora - this.inicioTiempoEfectivo1) / 1000;
          this.tiempoEfectivo1 += diff;
          this.inicioTiempoEfectivo1 = ahora;
        }

        // Se actualiza la vista
        for (let i = 0; i < this.palabraJugador1.length; i++) {
          if (this.palabraJugador1[i] === letra) {
            this.palabraOculta1[i] = letra;
          }
        }

        // En caso de ganar se termina la ronda
        if (!this.palabraOculta1.includes('_')) {
          this.rondasGanadas1++;
          this.terminarRondaJugador(1, true);
        }
      } else {

        // Si es incorrecta, actualizar tiempo efectivo (si estaba contando)
        if (this.inicioTiempoEfectivo1 !== null) {
          const diff = (ahora - this.inicioTiempoEfectivo1) / 1000;
          this.tiempoEfectivo1 += diff;
          this.inicioTiempoEfectivo1 = null;
        }
        this.intentos1++;
        if (this.intentos1 >= this.maxIntentos) {
          this.terminarRondaJugador(1, false);
        } else {
          this.cambiarTurno();
        }
      }
    } else if (this.turnoActual === 2 && !this.rondaTerminada2) {
      if (this.letrasUsadas2.has(letra)) return;
      this.letrasUsadas2.add(letra);

      if (this.palabraJugador2.includes(letra)) {
        if (this.inicioTiempoEfectivo2 === null) {
          this.inicioTiempoEfectivo2 = ahora;
        } else {
          const diff = (ahora - this.inicioTiempoEfectivo2) / 1000;
          this.tiempoEfectivo2 += diff;
          this.inicioTiempoEfectivo2 = ahora;
        }
        for (let i = 0; i < this.palabraJugador2.length; i++) {
          if (this.palabraJugador2[i] === letra) {
            this.palabraOculta2[i] = letra;
          }
        }
        if (!this.palabraOculta2.includes('_')) {
          this.rondasGanadas2++;
          this.terminarRondaJugador(2, true);
        }
      } else {
        if (this.inicioTiempoEfectivo2 !== null) {
          const diff = (ahora - this.inicioTiempoEfectivo2) / 1000;
          this.tiempoEfectivo2 += diff;
          this.inicioTiempoEfectivo2 = null;
        }
        this.intentos2++;
        if (this.intentos2 >= this.maxIntentos) {
          this.terminarRondaJugador(2, false);
        } else {
          this.cambiarTurno();
        }
      }
    }
  }

  // Finaliza la ronda de un jugador en caso de que haya terminado para esperar
  terminarRondaJugador(jugador: number, exito: boolean): void {
    const ahora = Date.now();
    this.detenerTodosCronometros();
    if (jugador === 1) {
      if (this.inicioTiempoEfectivo1 !== null) {
        const diff = (ahora - this.inicioTiempoEfectivo1) / 1000;
        this.tiempoEfectivo1 += diff;
        this.inicioTiempoEfectivo1 = null;
      }
      this.tiempoTotal1 += this.cronometroJugador1;
      this.rondaTerminada1 = true;
    } else {
      if (this.inicioTiempoEfectivo2 !== null) {
        const diff = (ahora - this.inicioTiempoEfectivo2) / 1000;
        this.tiempoEfectivo2 += diff;
        this.inicioTiempoEfectivo2 = null;
      }
      this.tiempoTotal2 += this.cronometroJugador2;
      this.rondaTerminada2 = true;
    }
    this.cambiarTurno();
    // Si ambos jugadores terminaron la ronda, procesar fin de ronda
    if (this.rondaTerminada1 && this.rondaTerminada2) {
      this.procesarFinDeRonda();
    }
  }

  // Cambia el turno actual entre 1 y 2
  cambiarTurno(): void {
    if (this.turnoActual === 1 && !this.rondaTerminada2) {
      this.turnoActual = 2;
    } else if (this.turnoActual === 2 && !this.rondaTerminada1) {
      this.turnoActual = 1;
    }
    this.iniciarCronometro();
  }

  // Por cada ronda al final se procesa para reiniciar los contadores
  procesarFinDeRonda(): void {
    if (this.rondaActual < 2) {
      alert(`Ronda ${this.rondaActual} finalizada.`);
      this.rondaActual++;

      // Reiniciar contadores de turno para la nueva ronda, conservando acumulados
      this.intentos1 = 0;
      this.intentos2 = 0;
      this.cronometroJugador1 = 0;
      this.cronometroJugador2 = 0;
      this.letrasUsadas1.clear();
      this.letrasUsadas2.clear();
      this.rondaTerminada1 = false;
      this.rondaTerminada2 = false;

      // Obtener nuevas palabras para la siguiente ronda
      this.obtenerPalabraJugador1();
      this.obtenerPalabraJugador2();
      this.iniciarCronometro();
    } else {
      this.finalizarPartida();
    }
  }

  // Cronometros de jugadores
  iniciarCronometro(): void {
    // Antes de iniciar, detener cualquier cronómetro en ejecución
    this.detenerTodosCronometros();
    if (this.turnoActual === 1 && !this.rondaTerminada1) {
      this.intervaloJugador1 = setInterval(() => {
        this.cronometroJugador1++;
      }, 1000);
    } else if (this.turnoActual === 2 && !this.rondaTerminada2) {
      this.intervaloJugador2 = setInterval(() => {
        this.cronometroJugador2++;
      }, 1000);
    }
  }

  detenerTodosCronometros(): void {
    if (this.intervaloJugador1) {
      clearInterval(this.intervaloJugador1);
      this.intervaloJugador1 = null;
    }
    if (this.intervaloJugador2) {
      clearInterval(this.intervaloJugador2);
      this.intervaloJugador2 = null;
    }
  }

  // Finaliza la partida y crea el objeto Historico para almacenar
  finalizarPartida(): void {
    this.detenerTodosCronometros();
    let ganador: string | null = null;
    if (this.rondasGanadas1 > this.rondasGanadas2) {
      ganador = this.jugador1.nombre;
      this.mensajeFinal = `¡Ganó ${this.jugador1.nombre}!`;
    } else if (this.rondasGanadas2 > this.rondasGanadas1) {
      ganador = this.jugador2.nombre;
      this.mensajeFinal = `¡Ganó ${this.jugador2.nombre}!`;
    } else {
      if (this.tiempoEfectivo1 < this.tiempoEfectivo2) {
        ganador = this.jugador1.nombre;
        this.mensajeFinal = `Empate en rondas. Desempate: gana ${this.jugador1.nombre}`;
      } else if (this.tiempoEfectivo2 < this.tiempoEfectivo1) {
        ganador = this.jugador2.nombre;
        this.mensajeFinal = `Empate en rondas. Desempate: gana ${this.jugador2.nombre}`;
      } else {
        this.mensajeFinal = '¡Empate total!';
      }
    }
    // Agregar información del tiempo efectivo a mostrar
    this.mensajeFinal += `
  ${this.jugador1.nombre} - Tiempo efectivo: ${this.tiempoEfectivo1.toFixed(1)} s
  ${this.jugador2.nombre} - Tiempo efectivo: ${this.tiempoEfectivo2.toFixed(1)} s`;
    
    this.finDelJuego = true;
    
    // Crear el objeto historial y enviarlo al backend
    const historialPartida = new HistoricoPartida(
      this.jugador1.nombre,
      this.jugador2.nombre,
      "Finalizada",
      ganador
    );
    
    this.apiService.postHistorico(historialPartida).subscribe({
      next: (res) => console.log("Partida almacenada en historial", res),
      error: (err) => console.error("Error al almacenar la partida", err)
    });
  }

  // Da funcionalidad de set inicial al boton de reiniciar
  reiniciarJuego(): void {
    this.detenerTodosCronometros();
    this.configurado = false;
    this.finDelJuego = false;
    this.mensajeFinal = '';
    this.nombreJugador1 = '';
    this.nombreJugador2 = '';
    this.turnoActual = 0;
    this.intentos1 = 0;
    this.intentos2 = 0;
    this.tiempoTotal1 = 0;
    this.tiempoTotal2 = 0;
    this.rondasGanadas1 = 0;
    this.rondasGanadas2 = 0;
    this.tiempoEfectivo1 = 0;
    this.tiempoEfectivo2 = 0;
    this.rondaActual = 1;
    this.rondaTerminada1 = false;
    this.rondaTerminada2 = false;
    this.reiniciarEstadoJugador1();
    this.reiniciarEstadoJugador2();
  }

  limpiarIntervalos(): void {
    this.detenerTodosCronometros();
  }
}
