import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HERO_TECH, PROFILE } from '../../data/portfolio.data';

@Component({
  selector: 'app-hero',
  imports: [RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class Hero {
  protected readonly profile = PROFILE;
  protected readonly tech = HERO_TECH;

  /** The monogram stays visible until the portrait has actually loaded. */
  protected readonly portraitLoaded = signal(false);
}
