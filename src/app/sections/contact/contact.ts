import { Component, signal } from '@angular/core';
import { PROFILE } from '../../data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';
import { SectionHeader } from '../../shared/section-header';

/**
 * The site has no backend, so the form composes an email in the visitor's mail
 * app (mailto). Native constraint validation keeps it dependency-free.
 */
@Component({
  selector: 'app-contact',
  imports: [SectionHeader, RevealDirective],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {
  protected readonly profile = PROFILE;
  protected readonly submitted = signal(false);
  protected readonly status = signal('');

  protected readonly channels = [
    { icon: 'fa-solid fa-envelope', label: 'Email', value: PROFILE.email, href: `mailto:${PROFILE.email}`, external: false },
    { icon: 'fa-brands fa-linkedin-in', label: 'LinkedIn', value: 'in/phillipcasingal', href: PROFILE.linkedin, external: true },
    { icon: 'fa-brands fa-github', label: 'GitHub', value: 'Phil1ipfs', href: PROFILE.github, external: true }
  ];

  protected onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    this.submitted.set(true);

    if (!form.checkValidity()) {
      this.status.set('Please fill in the highlighted fields.');
      form.querySelector<HTMLElement>(':invalid')?.focus();
      return;
    }

    const data = new FormData(form);
    const name = String(data.get('name')).trim();
    const email = String(data.get('email')).trim();
    const message = String(data.get('message')).trim();

    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${PROFILE.email}?subject=${subject}&body=${body}`;

    this.status.set('Your email app should open with the message ready to send.');
  }
}
