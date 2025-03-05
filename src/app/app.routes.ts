import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'juego', component: AppComponent },
  { path: '**', redirectTo: '' }
];