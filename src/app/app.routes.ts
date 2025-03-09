import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { JuegoComponent } from './juego/juego.component';
import { HistorialComponent } from './historial/historial.component';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'juego', component: JuegoComponent },
  { path: 'historial', component: HistorialComponent },
  { path: '**', redirectTo: '' }
];