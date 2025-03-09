// Modelo para representar los resultados de una partida. Almacena los nombres de los jugadores,
// el resultado (por ejemplo, “Finalizada”) y,
// en caso de haber un ganador, su nombre; en caso de empate, se deja null en el ganador.
export class HistoricoPartida {
    constructor(
      public jugador1: string,
      public jugador2: string,
      public resultado: string,
      public ganador: string | null
    ) {}
  }
  