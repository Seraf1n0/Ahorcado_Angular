import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteConfigLoadEnd, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {

  constructor() {

  }
}