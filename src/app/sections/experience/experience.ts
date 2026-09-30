import { Component, inject } from '@angular/core';
import { EDUCATION, EVENTS, EXPERIENCE, ORGANIZATIONS } from '../../data/portfolio.data';
import { CertViewerService } from '../../shared/cert-viewer';
import { RevealDirective } from '../../shared/reveal.directive';
import { SectionHeader } from '../../shared/section-header';

@Component({
  selector: 'app-experience',
  imports: [SectionHeader, RevealDirective],
  templateUrl: './experience.html',
  styleUrl: './experience.css'
})
export class Experience {
  protected readonly experience = EXPERIENCE;
  protected readonly organizations = ORGANIZATIONS;
  protected readonly events = EVENTS;
  protected readonly education = EDUCATION;
  protected readonly certViewer = inject(CertViewerService);
}
