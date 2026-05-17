import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-ring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-ring.html',
  styleUrl: './progress-ring.css'
})
export class ProgressRingComponent implements OnInit {
  @Input() score: number = 0;
  @Input() size: number = 56;
  @Input() strokeWidth: number = 5;
  
  circumference: number = 0;
  offset: number = 0;

  ngOnInit() {
    const radius = (this.size - this.strokeWidth) / 2;
    this.circumference = radius * 2 * Math.PI;
    this.offset = this.circumference; // Start at 0%
    
    // Animate on load
    setTimeout(() => {
      this.offset = this.circumference - (this.score / 100) * this.circumference;
    }, 50);
  }

  getColor(): string {
    if (this.score >= 80) return 'var(--accent-base)';
    if (this.score >= 50) return '#d97706';
    return '#dc2626';
  }
}
