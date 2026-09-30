import { Component, computed, inject, signal } from '@angular/core';
import { CERTIFICATIONS, CERT_TOPIC_ICONS } from '../../data/portfolio.data';
import { CertViewerService } from '../../shared/cert-viewer';
import { RevealDirective } from '../../shared/reveal.directive';
import { SectionHeader } from '../../shared/section-header';

const INITIAL_COUNT = 6;

@Component({
  selector: 'app-certifications',
  imports: [SectionHeader, RevealDirective],
  templateUrl: './certifications.html',
  styleUrl: './certifications.css'
})
export class Certifications {
  protected readonly icons = CERT_TOPIC_ICONS;
  protected readonly total = CERTIFICATIONS.length;
  protected readonly expanded = signal(false);
  protected readonly visible = computed(() => (this.expanded() ? CERTIFICATIONS : CERTIFICATIONS.slice(0, INITIAL_COUNT)));
  protected readonly certViewer = inject(CertViewerService);
}
