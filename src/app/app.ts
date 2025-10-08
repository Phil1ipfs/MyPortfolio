import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { LiquidEtherFull } from './liquid-ether-full';
import { ProfileCard } from './profile-card';
import { BlurText } from './blur-text';
import { LanyardDrag } from './lanyard-drag';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, AfterViewInit, OnDestroy {
  protected title = 'phillip-portfolio';
  private liquidEther?: LiquidEtherFull;
  private profileCard?: ProfileCard;
  private blurTextDeveloper?: BlurText;
  private blurTextDesigner?: BlurText;
  private lanyardDrag?: LanyardDrag;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Initialize Liquid Ether on the background element
    setTimeout(() => {
      const container = document.getElementById('liquidEther');
      console.log('Container found:', container);
      if (container) {
        try {
          this.liquidEther = new LiquidEtherFull(container, {
            colors: ['#5227FF', '#FF9FFC', '#B19EEF'],
            mouseForce: 30,
            cursorSize: 80,
            isViscous: false,
            viscous: 30,
            iterationsViscous: 32,
            iterationsPoisson: 32,
            resolution: 0.5,
            isBounce: false,
            autoDemo: true,
            autoSpeed: 0.5,
            autoIntensity: 1.5,
            takeoverDuration: 0.25,
            autoResumeDelay: 2000,
            autoRampDuration: 0.6
          });
          console.log('LiquidEther initialized successfully');
        } catch (error) {
          console.error('Error initializing LiquidEther:', error);
        }
      } else {
        console.error('Container #liquidEther not found');
      }

      // Initialize ProfileCard for About section image
      const aboutImageContainer = document.querySelector('.about-image-container') as HTMLElement;
      if (aboutImageContainer) {
        try {
          this.profileCard = new ProfileCard(aboutImageContainer, {
            maxTilt: 10,
            scale: 1.08,
            speed: 500,
            perspective: 1000,
            glareEnable: true,
            glareMaxOpacity: 0.3,
            glareColor: '#B19EEF',
            glarePosition: 'bottom'
          });
          console.log('ProfileCard initialized successfully');
        } catch (error) {
          console.error('Error initializing ProfileCard:', error);
        }
      }

      // Initialize BlurText for DEVELOPER text
      const developerText = document.querySelector('.title-developer-text') as HTMLElement;
      if (developerText) {
        try {
          this.blurTextDeveloper = new BlurText(developerText, {
            text: 'DEVELOPER',
            delay: 100,
            animateBy: 'letters',
            direction: 'top',
            stepDuration: 0.4,
            onAnimationComplete: () => console.log('Developer animation complete')
          });
          console.log('BlurText Developer initialized successfully');
        } catch (error) {
          console.error('Error initializing BlurText Developer:', error);
        }
      }

      // Initialize BlurText for DESIGNER text
      const designerText = document.querySelector('.title-designer-text') as HTMLElement;
      if (designerText) {
        try {
          this.blurTextDesigner = new BlurText(designerText, {
            text: 'DESIGNER',
            delay: 120,
            animateBy: 'letters',
            direction: 'bottom',
            stepDuration: 0.4,
            onAnimationComplete: () => console.log('Designer animation complete')
          });
          console.log('BlurText Designer initialized successfully');
        } catch (error) {
          console.error('Error initializing BlurText Designer:', error);
        }
      }

      // Initialize Lanyard Drag
      const lanyardCard = document.querySelector('.lanyard-card') as HTMLElement;
      console.log('Lanyard card element found:', lanyardCard);
      if (lanyardCard) {
        try {
          this.lanyardDrag = new LanyardDrag(lanyardCard, {
            friction: 0.95,
            gravity: 0.5,
            maxRotation: 25
          });
          console.log('Lanyard drag initialized successfully');
        } catch (error) {
          console.error('Error initializing Lanyard drag:', error);
        }
      } else {
        console.error('Lanyard card element not found!');
      }

      // Initialize Mobile Sidebar
      this.initMobileSidebar();

    }, 100);
  }

  private initMobileSidebar(): void {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('mobileSidebar');
    const sidebarClose = document.getElementById('mobileSidebarClose');
    const sidebarOverlay = document.getElementById('mobileSidebarOverlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (!menuToggle || !sidebar || !sidebarClose || !sidebarOverlay) {
      console.warn('Mobile sidebar elements not found');
      return;
    }

    // Open sidebar
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.add('active');
      sidebar.classList.add('active');
      sidebarOverlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling when sidebar is open
    });

    // Close sidebar function
    const closeSidebar = () => {
      menuToggle.classList.remove('active');
      sidebar.classList.remove('active');
      sidebarOverlay.classList.remove('active');
      document.body.style.overflow = ''; // Re-enable scrolling
    };

    // Close sidebar when clicking close button
    sidebarClose.addEventListener('click', closeSidebar);

    // Close sidebar when clicking overlay
    sidebarOverlay.addEventListener('click', closeSidebar);

    // Close sidebar when clicking any navigation link
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        setTimeout(closeSidebar, 300); // Small delay for smooth transition
      });
    });

    console.log('Mobile sidebar initialized successfully');
  }

  ngOnDestroy(): void {
    if (this.liquidEther) {
      this.liquidEther.dispose();
    }
    if (this.profileCard) {
      this.profileCard.dispose();
    }
    if (this.blurTextDeveloper) {
      this.blurTextDeveloper.dispose();
    }
    if (this.blurTextDesigner) {
      this.blurTextDesigner.dispose();
    }
    if (this.lanyardDrag) {
      this.lanyardDrag.dispose();
    }
  }
}
