import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-exito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-exito.component.html',
  styleUrls: ['./form-exito.component.css']
})
export class FormExitoComponent {

  constructor(private router: Router) {}
}
