import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Template } from '../../services/template.service';
import { FALLBACK_TEMPLATES } from '../../modules/builder/templates/template-registry';

@Component({
  selector: 'app-template-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './template-selector.html',
  styleUrl: './template-selector.css'
})
export class TemplateSelectorComponent implements OnInit {
  templates: Template[] = [];
  @Output() selectTemplate = new EventEmitter<Template>();

  ngOnInit(): void {
    this.templates = FALLBACK_TEMPLATES as any[];
  }

  onSelect(template: Template): void {
    this.selectTemplate.emit(template);
  }
}
