import { Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CERTIFICATIONS, CERT_TOPIC_ICONS, CREDLY_BADGES } from '../../data/portfolio.data';
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

  /** Same iframe Credly's embed.js would inject, without loading the script. */
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly badges = CREDLY_BADGES.map(id => ({
    id,
    src: this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.credly.com/embedded_badge/${id}`)
  }));
}
