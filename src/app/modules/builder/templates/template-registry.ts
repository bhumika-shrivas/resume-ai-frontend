import { Type } from '@angular/core';

import { ModernTemplateComponent } from './modern-template/modern-template.component';
import { MinimalTemplateComponent } from './minimal-template/minimal-template.component';
import { ExecutiveTemplateComponent } from './executive-template/executive-template.component';
import { CreativeTemplateComponent } from './creative-template/creative-template.component';
import { AtsTemplateComponent } from './ats-template/ats-template.component';
import { EntryTemplateComponent } from './entry-template/entry-template.component';
import { AtsProTemplateComponent } from './ats-pro-template/ats-pro-template.component';
import { ClassicTwoColTemplateComponent } from './classic-two-col-template/classic-two-col-template.component';
import { MunichTemplateComponent } from './munich-template/munich-template.component';

/** Data contract passed to every template component */
export interface TemplateComponentData {
  resumeData?: any;
  customization?: any;
}

/** Interface every template component must implement */
export interface ITemplateComponent {
  data: TemplateComponentData;
}

/**
 * Maps templateKey → Angular component class.
 * Used by the builder to dynamically render templates for live editing.
 */
export const TEMPLATE_REGISTRY: Record<string, Type<any>> = {
  'modern-template': ModernTemplateComponent,
  'minimal-template': MinimalTemplateComponent,
  'executive-template': ExecutiveTemplateComponent,
  'creative-template': CreativeTemplateComponent,
  'ats-template': AtsTemplateComponent,
  'entry-template': EntryTemplateComponent,
  'ats-pro-template': AtsProTemplateComponent,
  'classic-two-col-template': ClassicTwoColTemplateComponent,
  'munich-template': MunichTemplateComponent
};

/**
 * Fallback template metadata — used when the backend template-service is unreachable.
 * The primary source is always the backend; this ensures the app works offline.
 */
export const FALLBACK_TEMPLATES: any[] = [
  {
    templateId: 'modern-template',
    templateKey: 'modern-template',
    name: 'Modern Professional',
    description: 'A sleek two-column layout with a dark navy sidebar, accent colors, and clean typography.',
    category: 'Professional',
    primaryColor: '#2563eb',
    secondaryColor: '#1e293b',
    fontFamily: 'Inter',
    thumbnailUrl: '/assets/templates/modern-preview.png',
    previewImageUrl: '/assets/templates/modern-preview.png',
    isPremium: false,
    isActive: true,
    usageCount: 0
  },
  {
    templateId: 'minimal-template',
    templateKey: 'minimal-template',
    name: 'Minimal Clean',
    description: 'Ultra-minimalist single-column layout with elegant whitespace. ATS-optimised.',
    category: 'Minimalist',
    primaryColor: '#16a34a',
    secondaryColor: '#f0fdf4',
    fontFamily: 'Inter',
    thumbnailUrl: '/assets/templates/minimal-preview.png',
    previewImageUrl: '/assets/templates/minimal-preview.png',
    isPremium: false,
    isActive: true,
    usageCount: 0
  },
  {
    templateId: 'executive-template',
    templateKey: 'executive-template',
    name: 'Executive',
    description: 'Bold teal header with structured two-column grid for leadership roles.',
    category: 'Professional',
    primaryColor: '#0891b2',
    secondaryColor: '#e0f2fe',
    fontFamily: 'Inter',
    thumbnailUrl: '/assets/templates/executive-preview.png',
    previewImageUrl: '/assets/templates/executive-preview.png',
    isPremium: false,
    isActive: true,
    usageCount: 0
  },
  {
    templateId: 'creative-template',
    templateKey: 'creative-template',
    name: 'Creative Design',
    description: 'Vibrant gradient sidebar with skill bars and card-based sections for creatives.',
    category: 'Creative',
    primaryColor: '#7c3aed',
    secondaryColor: '#4f46e5',
    fontFamily: 'Inter',
    thumbnailUrl: '/assets/templates/creative-preview.png',
    previewImageUrl: '/assets/templates/creative-preview.png',
    isPremium: true,
    isActive: true,
    usageCount: 0
  },
  {
    templateId: 'ats-template',
    templateKey: 'ats-template',
    name: 'ATS Optimized',
    description: 'Traditional single-column serif layout. Parses perfectly through every ATS.',
    category: 'ATS',
    primaryColor: '#7f1d1d',
    secondaryColor: '#fef2f2',
    fontFamily: 'Georgia',
    thumbnailUrl: '/assets/templates/ats-preview.png',
    previewImageUrl: '/assets/templates/ats-preview.png',
    isPremium: false,
    isActive: true,
    usageCount: 0
  },
  {
    templateId: 'entry-template',
    templateKey: 'entry-template',
    name: 'Entry Level',
    description: 'Clean, professional single-column layout perfect for fresh graduates and early-career professionals.',
    category: 'Entry Level',
    primaryColor: '#555555',
    secondaryColor: '#f5f5f5',
    fontFamily: 'Inter',
    thumbnailUrl: 'https://www.careerreload.com/wp-content/uploads/2017/12/free-resume-template-sarah-01.jpg',
    previewImageUrl: 'https://www.careerreload.com/wp-content/uploads/2017/12/free-resume-template-sarah-01.jpg',
    isPremium: false,
    isActive: true,
    usageCount: 0
  },
  {
    templateId: 'ats-pro-template',
    templateKey: 'ats-pro-template',
    name: 'ATS Pro',
    description: 'Reverse-chronological ATS-optimized layout with navy header, centered key skills, and structured experience. Premium only.',
    category: 'ATS',
    primaryColor: '#1b3a5c',
    secondaryColor: '#c5a55a',
    fontFamily: 'Georgia',
    thumbnailUrl: 'https://www.careerhigher.co/wp-content/uploads/2021/01/Reverse-chronological-resume-layout.jpg',
    previewImageUrl: 'https://www.careerhigher.co/wp-content/uploads/2021/01/Reverse-chronological-resume-layout.jpg',
    isPremium: true,
    isActive: true,
    usageCount: 0
  },
  {
    templateId: 'classic-two-col-template',
    templateKey: 'classic-two-col-template',
    name: 'Classic Elegant',
    description: 'Two-column layout with section labels on the left and content on the right. Elegant orange accent with serif typography. Premium only.',
    category: 'ATS',
    primaryColor: '#c06014',
    secondaryColor: '#f9f5f0',
    fontFamily: 'Georgia',
    thumbnailUrl: 'https://i1-c.pinimg.com/1200x/4f/01/05/4f01051f9f9083ad70230a77d074e570.jpg',
    previewImageUrl: 'https://i1-c.pinimg.com/1200x/4f/01/05/4f01051f9f9083ad70230a77d074e570.jpg',
    isPremium: true,
    isActive: true,
    usageCount: 0
  },
  {
    templateId: 'munich-template',
    templateKey: 'munich-template',
    name: 'Munich',
    description: 'Two-column sidebar layout with large serif name, contact icons, and structured sections. Premium only.',
    category: 'Entry Level',
    primaryColor: '#555555',
    secondaryColor: '#f5f5f5',
    fontFamily: 'Inter',
    thumbnailUrl: 'https://static.resumecoach.com/assets/templates/thumbnails/en/noPhoto/munich-736x1041.webp',
    previewImageUrl: 'https://static.resumecoach.com/assets/templates/thumbnails/en/noPhoto/munich-736x1041.webp',
    isPremium: true,
    isActive: true,
    usageCount: 0
  }
];