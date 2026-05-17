import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action-card.html',
  styleUrl: './action-card.css'
})
export class ActionCardComponent {
  @Input() label: string = '';
}
