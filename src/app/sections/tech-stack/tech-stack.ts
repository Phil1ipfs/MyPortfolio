import { Component } from '@angular/core';
import { OTHER_TOOLS, TECH_STACK } from '../../data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';
import { SectionHeader } from '../../shared/section-header';

@Component({
  selector: 'app-tech-stack',
  imports: [SectionHeader, RevealDirective],
  templateUrl: './tech-stack.html',
  styleUrl: './tech-stack.css'
})
export class TechStack {
  protected readonly categories = TECH_STACK;
  protected readonly tools = OTHER_TOOLS;
}
