/**
 * Single source of truth for portfolio content.
 * Sourced from the CV (Casingal_John Phillip B_CV.pdf), the previous site copy,
 * and the certificate images in /public/certs. Do not add metrics or claims
 * that are not backed by one of those sources.
 */

export const PROFILE = {
  firstName: 'John Phillip',
  lastName: 'Casingal',
  initials: 'JC',
  role: 'Mobile & Web Application Developer',
  location: 'Quezon City, Philippines',
  email: 'johncasingal63@gmail.com',
  linkedin: 'https://www.linkedin.com/in/phillipcasingal',
  github: 'https://github.com/Phil1ipfs',
  website: 'https://phillip-portfolio.vercel.app',
  cv: 'Casingal_John_Phillip_CV.pdf',
  /** White-shirt portrait (optimized from public/corporate profile.png). A monogram shows if it fails to load. */
  portrait: 'profile-portrait.jpg',
  /** Condensed from the CV summary and skills. */
  intro:
    'Mobile and web developer with hands-on software development experience — building responsive apps from Figma designs and pixel-accurate interfaces to REST APIs, databases and cloud deployment.'
} as const;

export interface NavItem { id: string; label: string; }

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'tech-stack', label: 'Tech Stack' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' }
];

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export type ProjectCategory = 'Mobile' | 'Web' | 'Full Stack' | 'Design' | 'Game';

export interface RepoLink { label: string; url: string; }

/** One image in a case study's Preview gallery. The caption is also its alt text. */
export interface GalleryImage { src: string; caption: string; }

const GH = 'https://github.com/Phil1ipfs/';

export interface CaseStudy {
  problem?: string;
  solution?: string;
  role?: string[];
  features?: string[];
  architecture?: { layer: string; items: string[] }[];
  outcome?: string;
}

export interface Project {
  slug: string;
  name: string;
  /** Short category line shown under the name. */
  tagline: string;
  categories: ProjectCategory[];
  summary: string;
  overview: string;
  technologies: string[];
  image?: string;
  /** Extra screenshots for the case study gallery. The caption is also the image's alt text. */
  gallery?: GalleryImage[];
  /** Optional demo video (e.g. 'projects/<slug>.mp4'), shown in the case study; loads only when played. */
  video?: string;
  /** Portrait phone mockups look better contained than cropped. */
  imageFit?: 'cover' | 'contain';
  /** CSS object-position for a cropped cover (default 'left top') — for screenshots with off-centre content. */
  imagePosition?: string;
  /** Show the cover without the case-study frame (border, background, shadow) — for logos. */
  imageBare?: boolean;
  accent: string;
  featured?: boolean;
  /** Shown in the main projects block, right after the featured ones (no badge). */
  showcase?: boolean;
  date?: string;
  caseStudy?: CaseStudy;
  liveUrl?: string;
  /** Label for the live link button (defaults to 'Live demo'). */
  liveLabel?: string;
  /** Public GitHub repositories (github.com/Phil1ipfs). */
  repos?: RepoLink[];
}

export const PROJECT_FILTERS: ('All' | ProjectCategory)[] = ['All', 'Mobile', 'Web', 'Full Stack', 'Design', 'Game'];

export const PROJECTS: Project[] = [
  {
    slug: 'literexia',
    name: 'Literexia',
    tagline: 'Assistive learning app for students with dyslexia',
    categories: ['Mobile', 'Full Stack'],
    summary:
      'My capstone project: a Flutter learning app for students with dyslexia, with a web platform for teachers, parents and admins.',
    overview:
      'Literexia is my capstone project — a learning system for students with dyslexia. Students use a Flutter mobile app for lessons and assessments, while teachers, parents and administrators use a React web platform backed by a Node.js/Express API, MongoDB, AWS S3 and AI services.',
    technologies: [
      'Flutter', 'Dart', 'React', 'Vite', 'Node.js', 'Express.js', 'MongoDB', 'AWS S3',
      'Socket.IO', 'JWT', 'OpenAI', 'ElevenLabs', 'Kotlin', 'Figma'
    ],
    accent: '#7c6cff',
    featured: true,
    repos: [
      { label: 'Mobile app', url: GH + 'Mobile-Application-Literexia' },
      { label: 'Web platform', url: GH + 'Dyslexia' }
    ],
    image: 'projects/literexia1.png',
    gallery: [
      { src: 'projects/literexia2.png', caption: 'Mobile app — lesson path, starting with Aralin 1: Phonological Awareness' },
      { src: 'projects/literexia3.png', caption: 'Mobile app — audio letter-matching exercise' },
      { src: 'projects/literexia4.png', caption: 'Mobile app — accessibility settings: text-to-speech, font, reading speed, text size and letter spacing' }
    ],
    liveUrl: 'https://literexia-web-eta.vercel.app/',
    caseStudy: {
      problem:
        'Text-heavy learning material is a barrier for many students with dyslexia, and teachers need a clear way to assess them and follow their progress. Literexia connects both sides.',
      solution:
        'A Flutter app where students work through lessons and assessments, connected to a role-based web platform where teachers track progress, plan interventions and generate reports — with AI assistance and text-to-speech built in.',
      role: [
        'Developed Literexia as my BS Information Technology capstone project',
        'Designed the user interface in Figma',
        'Built the Flutter mobile app and the React (Vite) web platform',
        'Developed the Node.js/Express REST API with JWT authentication, MongoDB and AWS S3 file storage',
        'Integrated the OpenAI and ElevenLabs APIs for the assistive tools'
      ],
      features: [
        'Student mobile app with Filipino-language lessons and assessments, starting with phonological awareness',
        'Audio-based exercises, such as matching spoken letters to written ones',
        'Reading accessibility settings: text-to-speech, font choice, reading speed, text size and letter spacing',
        'Role-based dashboards for teachers, parents and admins',
        'Progress tracking, intervention monitoring and IEP support',
        'Prescriptive analytics and downloadable PDF progress reports',
        'AI chatbot for teachers (OpenAI) and text-to-speech (ElevenLabs)',
        'Real-time notifications (Socket.IO) and file uploads to AWS S3'
      ],
      architecture: [
        { layer: 'Mobile app', items: ['Flutter', 'Dart', 'SQLite (local)'] },
        { layer: 'Web app', items: ['React', 'Vite', 'Chart.js'] },
        { layer: 'API', items: ['Node.js', 'Express', 'JWT', 'Socket.IO'] },
        { layer: 'Data & storage', items: ['MongoDB', 'AWS S3'] },
        { layer: 'AI services', items: ['OpenAI API', 'ElevenLabs API'] }
      ],
      outcome:
        'Completed as my capstone project for the BS Information Technology program (Major in Mobile and Web Applications) at National University.'
    }
  },
  {
    slug: 'bulldog-exchange',
    name: 'Bulldog Exchange',
    tagline: 'Website redesign on the MERN stack',
    categories: ['Web', 'Full Stack'],
    summary:
      'A MERN-stack redesign of NU Bulldogz Exchange — the online shop for official National University uniforms and merchandise.',
    overview:
      'A redesign of NU Bulldogz Exchange, the one-stop online shop for official National University uniforms and merchandise, built with the MERN stack — MongoDB, Express.js, React and Node.js. The storefront includes shop, uniform and merchandise sections, product search, a cart, and account sign-in and registration.',
    technologies: ['MongoDB', 'Express.js', 'React', 'Node.js'],
    image: 'projects/bulldogexchange.png',
    accent: '#3b82f6',
    featured: true,
    liveUrl: 'https://casingal-nu-bulldog-exchange-web.vercel.app/',
    repos: [{ label: 'GitHub', url: GH + 'Casingal_NU_BULLDOG_EXCHANGE_WEB' }]
  },
  {
    slug: 'pinkventory',
    name: 'Pinkventory',
    tagline: 'Inventory management system',
    categories: ['Web', 'Full Stack'],
    summary:
      'A full-stack inventory management and e-commerce web application built with vanilla PHP and MySQL (LAMP stack), with role-based admin and customer portals, transactional order processing, and a responsive custom UI.',
    overview:
      'Designed and developed a user-friendly inventory tracking system for businesses. Implemented real-time updates and analytics for efficient stock management, with performance and security improved through optimized backend solutions.',
    technologies: ['PHP', 'MySQL', 'JavaScript', 'HTML5', 'CSS3', 'Figma'],
    image: 'projects/pinkventory.png',
    accent: '#ec4899',
    featured: true,
    date: 'Feb 2025',
    liveUrl: 'https://pinkventory.free.je/index.php',
    repos: [{ label: 'GitHub', url: GH + 'Pinkventorys' }]
  },
  {
    slug: 'myriad',
    name: 'Myriad',
    tagline: 'Health support app for the LGBTQIA+ community',
    categories: ['Mobile', 'Full Stack'],
    summary:
      'A mobile health support hub giving the LGBTQIA+ community of Padre Garcia a safe, private space for health information, wellness education and local events. Published on Google Play.',
    overview:
      'Myriad is a mobile health support hub built for the LGBTQIA+ community in Padre Garcia — a safe, inclusive and private space to access reliable health information, supportive resources and community features without fear of judgment. It is published on Google Play and pairs a Flutter mobile client with a Node.js/Express API and a PostgreSQL database.',
    technologies: ['Flutter', 'Dart', 'Node.js', 'Express.js', 'PostgreSQL', 'Sequelize', 'Cloudinary', 'JWT'],
    image: 'projects/myriad.png',
    imageFit: 'contain',
    imageBare: true,
    // From the Google Play listing; patient names in the dashboard are pixelated.
    gallery: [
      { src: 'projects/myriad-dashboard.jpg', caption: 'Doctor dashboard — patients, messages, upcoming appointments and events' },
      { src: 'projects/myriad-events.jpg', caption: 'Event management — search and filter community events' }
    ],
    accent: '#a78bfa',
    liveUrl: 'https://play.google.com/store/apps/details?id=com.weirdo.myriad',
    liveLabel: 'Google Play',
    repos: [{ label: 'GitHub', url: GH + 'myriad' }],
    caseStudy: {
      problem:
        'LGBTQIA+ individuals in Padre Garcia face limited access to health information, few support systems, and stigma that can keep them from seeking help in traditional spaces.',
      solution:
        'One confidential app that brings together general health guidance, wellness education, local event announcements and digital advocacy — designed with privacy and user comfort at its core.',
      features: [
        'General health guidance and wellness education',
        'Updates on local LGBTQIA+-friendly events',
        'Community engagement and digital advocacy',
        'Secure login and privacy-first design'
      ],
      architecture: [
        { layer: 'Mobile app', items: ['Flutter', 'Dart'] },
        { layer: 'API', items: ['Node.js', 'Express', 'JWT auth'] },
        { layer: 'Data & media', items: ['PostgreSQL', 'Sequelize', 'Cloudinary'] },
        { layer: 'Hosting', items: ['Render', 'Google Play'] }
      ],
      outcome: 'Published on the Google Play Store.'
    }
  },
  {
    slug: 'communify',
    name: 'Communify',
    tagline: 'Community-driven issue reporting app',
    categories: ['Mobile', 'Design'],
    summary: 'A mobile app that empowers citizens to report local infrastructure issues and follow them through to action.',
    overview:
      'A mobile app that empowers individuals and communities to report local issues and improve their environment through a feedback-driven system — fostering collaboration between citizens and local authorities.',
    technologies: ['Flutter', 'Figma'],
    image: 'projects/communify.jpg',
    imageFit: 'contain',
    accent: '#8b5cf6',
    repos: [{ label: 'Figma design', url: GH + 'Communify_Design' }]
  },
  {
    slug: 'ecodex',
    name: 'EcoDex',
    tagline: 'AI-powered plant identification & conservation app',
    categories: ['Mobile', 'Design'],
    summary: 'An AI-driven mobile app design for plant identification, with gamification for conservation engagement.',
    overview:
      'Designed an AI-driven mobile app for plant identification using deep learning and image processing, with gamification features that encourage engagement in environmental conservation.',
    technologies: ['Figma'],
    image: 'projects/ecodex.jpg',
    imageFit: 'contain',
    accent: '#10b981',
    date: 'May 2025',
    repos: [{ label: 'Figma design', url: GH + 'Ecodex_DESIGN' }]
  },
  {
    slug: 'reusify',
    name: 'Reusify',
    tagline: 'Sustainable e-commerce platform',
    categories: ['Mobile', 'Design'],
    summary: 'An e-commerce concept connecting consumers with upcycled and reusable products.',
    overview:
      'A sustainable e-commerce platform that promotes eco-friendly shopping by connecting consumers with upcycled and reusable products.',
    technologies: ['Figma'],
    image: 'projects/reusify.jpg',
    imageFit: 'contain',
    accent: '#ec4899'
  },
  {
    slug: 'nu-learn',
    name: 'NU-Learn',
    tagline: 'E-learning platform landing page',
    categories: ['Design'],
    summary: 'A minimal landing page design for an online learning platform.',
    overview:
      'A sleek landing page design for NU-Learn, an online learning platform — a soft, minimal palette with blue calls-to-action, a search bar and explore menu, and 3D-style illustrations for a welcoming feel.',
    technologies: ['Figma'],
    image: 'projects/elearning.jpg',
    repos: [{ label: 'Figma design', url: GH + 'E-LEARNING-DESIGN' }],
    accent: '#f59e0b'
  },
  {
    slug: 'resource-management-sim',
    name: 'Resource Management Simulation',
    tagline: '3D simulation game built in Unity',
    categories: ['Game'],
    summary: 'A 3D resource management simulation where you direct units to collect resources and carry them back to base.',
    overview:
      'A 3D resource management simulation built in Unity with C#. Players select units and send them to collect resources from resource piles and carry them back to base, with a main menu, a team colour picker and in-game info pop-ups.',
    technologies: ['Unity', 'C#'],
    accent: '#a855f7',
    // TODO: add the gameplay video at public/projects/resource-management-sim.mp4, then set:
    // video: 'projects/resource-management-sim.mp4',
    repos: [{ label: 'GitHub', url: GH + 'Resource-Management-Simulation-Using-Unity' }],
    caseStudy: {
      features: [
        'Select units with the mouse and send them to targets',
        'Transporter units carry resources from piles back to base',
        "Productivity units that multiply a resource pile's production speed",
        'Main menu with team colour picker and in-game info pop-ups'
      ],
      architecture: [
        { layer: 'Engine', items: ['Unity', 'C#', 'NavMesh agents'] },
        { layer: 'Gameplay', items: ['Unit → Transporter / Productivity units', 'Building → Resource pile / Base'] },
        { layer: 'Scenes', items: ['Menu', 'Main', 'Optimization'] }
      ]
    }
  },
  {
    slug: 'ecoguardian',
    name: 'EcoGuardian',
    tagline: '3D third-person game built in Unity',
    categories: ['Game'],
    summary: 'A 3D third-person game where the player explores an outdoor village environment, built in Unity with C#.',
    overview:
      'EcoGuardian is a 3D third-person game built in Unity with C#. The player controls a character exploring an outdoor village environment with a cabin, grassy hills and forest. The gameplay video shows the character moving through the world in play mode.',
    technologies: ['Unity', 'C#'],
    image: 'projects/ecoguardian.jpg',
    video: 'projects/ecoguardian.mp4',
    accent: '#22c55e',
    date: 'Sep 2024'
  },
  {
    slug: 'fruit-slasher',
    name: 'Fruit Slasher',
    tagline: 'Click-to-slash arcade game built in Unity',
    categories: ['Game'],
    summary: 'An arcade game where objects are tossed into the play area and the player clicks to slash them for points, built in Unity with C#.',
    overview:
      'Fruit Slasher is an arcade game built in Unity with C#. After choosing a difficulty (Easy, Medium or Hard) on the title screen, objects are launched into the play area and the player clicks to slash them, with the score updating live.',
    technologies: ['Unity', 'C#'],
    image: 'projects/fruit-slasher.jpg',
    video: 'projects/fruit-slasher.mp4',
    accent: '#f97316',
    caseStudy: {
      features: [
        'Title screen with Easy, Medium and Hard difficulty',
        'Objects spawn and are launched into the play area',
        'Click to slash objects, with particle effects',
        'Live score counter'
      ]
    }
  },
  {
    slug: 'story-book-app',
    name: 'Story Book App',
    tagline: 'Android story book app',
    categories: ['Mobile'],
    summary: 'A story book app for Android, built in Android Studio with Kotlin.',
    overview: 'A story book application for Android devices, built in Android Studio using Kotlin.',
    technologies: ['Kotlin', 'Android Studio'],
    accent: '#22c55e',
    repos: [{ label: 'GitHub', url: GH + 'Story-Book-Using-Android-Studio' }]
  },
  // Projects from the previous portfolio, showcased under the featured ones.
  {
    slug: 'photo-booth',
    showcase: true,
    name: 'Photo Booth Website',
    tagline: 'Web app for a photo booth experience',
    categories: ['Web'],
    summary: 'A React web app developed for a photo booth experience.',
    overview: 'A web application developed for a photo booth experience, built with React and CSS and designed in Figma.',
    technologies: ['React', 'CSS3', 'Figma'],
    image: 'projects/photobooth.png',
    accent: '#06b6d4',
    liveUrl: 'https://photobooth-seven-sooty.vercel.app/',
    repos: [{ label: 'GitHub', url: GH + 'photobooth' }]
  },
  {
    slug: 'amber',
    showcase: true,
    name: 'Amber Website',
    tagline: 'Modernized website for a Filipino cuisine brand',
    categories: ['Web', 'Design'],
    summary: "A redesign of Amber's website that modernizes its look and improves the user experience.",
    overview:
      "Redesigned Amber's website to enhance user experience and modernize its visual appeal — bold red-and-yellow branding, a hero showcasing Filipino dishes, a clear ordering call-to-action and intuitive navigation.",
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'Figma'],
    image: 'projects/amber.png',
    imagePosition: 'center top',
    accent: '#f59e0b',
    date: 'Jun 2025',
    liveUrl: 'https://amber-ivory.vercel.app/',
    repos: [{ label: 'Website code', url: GH + 'AMBER' }, { label: 'UI design', url: GH + 'AMBERS_UI_DESIGN' }]
  },
  {
    slug: 'afkar',
    showcase: true,
    name: 'AFKAR',
    tagline: 'Renewable energy website redesign',
    categories: ['Design'],
    summary: 'A clean, modern redesign for a renewable energy company.',
    overview:
      'A modern, clean redesign for a renewable energy company, using vibrant sustainability colors, a structured sticky navigation, and data-driven visuals.',
    technologies: ['Figma'],
    image: 'projects/afkar.jpg',
    accent: '#ef4444',
    repos: [{ label: 'Figma design', url: GH + 'AFKAR_RE-DESIGN' }]
  },
  {
    slug: 'everyjuana',
    showcase: true,
    name: "EveryJuan'a",
    tagline: 'Job finding platform',
    categories: ['Web'],
    summary: 'A job finding website that helps Filipinos discover opportunities that fit their skills.',
    overview:
      'A job finding website designed for Filipinos to discover employment opportunities that fit their skills and preferences.',
    technologies: ['Java'],
    image: 'projects/everyjuana.jpg',
    accent: '#2563eb'
  },
  {
    slug: 'the-pizzeria',
    showcase: true,
    name: 'The Pizzeria',
    tagline: 'Pizza ordering website',
    categories: ['Web'],
    summary: 'A pizza ordering website with an engaging ordering experience.',
    overview: 'Delightful Dough Pizzeria — a pizza ordering application with an engaging user experience, built in Java with JavaFX.',
    technologies: ['Java', 'JavaFX'],
    image: 'projects/pizzeria.jpg',
    accent: '#dc2626',
    repos: [{ label: 'GitHub', url: GH + 'PIZZA-SHOP' }]
  }
];

/* ------------------------------------------------------------------ */
/* Tech stack                                                          */
/* ------------------------------------------------------------------ */

export interface TechCategory { title: string; icon: string; items: string[]; }

export const TECH_STACK: TechCategory[] = [
  { title: 'Frontend', icon: 'fa-solid fa-code', items: ['React', 'Angular', 'TypeScript', 'HTML', 'CSS', 'Tailwind'] },
  { title: 'Backend', icon: 'fa-solid fa-server', items: ['Node.js', 'Express.js', 'REST APIs', 'Authentication', 'CRUD'] },
  { title: 'Database', icon: 'fa-solid fa-database', items: ['MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Supabase'] },
  { title: 'Deployment & Cloud', icon: 'fa-solid fa-cloud', items: ['AWS', 'AWS S3', 'AWS EC2', 'AWS Amplify', 'Vercel', 'Docker'] },
  { title: 'Mobile, Design & Tools', icon: 'fa-solid fa-screwdriver-wrench', items: ['Flutter', 'WordPress', 'Elementor', 'Figma', 'Git'] }
];

/** Secondary tools from the CV, shown in the "also worked with" strip. */
export const OTHER_TOOLS: string[] = [
  'JavaScript', 'Java', 'Python', 'PHP', 'C#', 'C++', 'Kotlin', 'OpenAI API', 'ElevenLabs',
  'Postman', 'VS Code', 'Android Studio', 'Adobe Illustrator', 'Blender', 'Unity', 'Claude'
];

export interface HeroTech { name: string; fa?: string; svg?: 'flutter' | 'mongodb'; }

export const HERO_TECH: HeroTech[] = [
  { name: 'React', fa: 'fa-brands fa-react' },
  { name: 'Angular', fa: 'fa-brands fa-angular' },
  { name: 'Flutter', svg: 'flutter' },
  { name: 'Node.js', fa: 'fa-brands fa-node-js' },
  { name: 'MongoDB', svg: 'mongodb' },
  { name: 'AWS', fa: 'fa-brands fa-aws' }
];

/* ------------------------------------------------------------------ */
/* Experience & education                                              */
/* ------------------------------------------------------------------ */

export const EXPERIENCE = [
  {
    role: 'Frontend Developer',
    org: 'Easy Bus PH',
    period: 'Sep 2025 – Sep 2026',
    points: [
      'Built and maintained WordPress websites, translating approved design mockups into pixel-accurate, responsive pages with Elementor',
      "Customized page sections and interactive components with custom CSS where Elementor's built-in controls fell short",
      'Ensured pages displayed correctly across devices and browsers, with mobile-first responsive behavior',
      'Reviewed builds against design specs and applied feedback quickly to meet release timelines'
    ]
  }
];

export interface Organization {
  role: string;
  org: string;
  /** Certificate image, opened in the viewer. */
  certificate?: string;
}

export interface CommunityEvent {
  title: string;
  org: string;
  date: string;
  /** Certificate image, opened in the viewer. */
  certificate?: string;
  /** Event photo (when there is no certificate), opened in the viewer. */
  photo?: string;
}

export const ORGANIZATIONS: Organization[] = [
  { role: 'Vice Operations Officer', org: 'AWS Learning Club Legarda' },
  { role: 'Technical Committee', org: 'Google Developer Group NU' },
  { role: 'Hackathon Committee', org: 'Google Developer Group NU' },
  { role: 'Volunteer', org: 'PyCon PH 2024', certificate: 'certs/pycon-ph-2024.jpg' },
  { role: 'Scholar', org: 'Quezon City Youth Development Office' }
];

export const EVENTS: CommunityEvent[] = [
  { title: '2nd Place, Ideathon 2024', org: 'NU Manila · Team Matinik', date: '2024', photo: 'certs/ideathon-2024.jpg' },
  { title: 'Hackercup 2024', org: 'De La Salle University', date: 'Jul 2024', certificate: 'certs/hackercup-2024.jpg' },
  { title: 'InnOlympics 2024', org: 'GDSC PLM', date: 'Apr 2024', certificate: 'certs/innolympics-2024.jpg' },
  { title: 'Blockchain Campus Conference 2023', org: 'Mapúa University', date: 'Nov 2023', certificate: 'certs/blockchain-campus-2023.jpg' },
  { title: 'Hackercup 2023', org: 'De La Salle University', date: 'Oct 2023', certificate: 'certs/hackercup-2023.jpg' }
];

export const EDUCATION = {
  degree: 'Bachelor of Science in Information Technology',
  major: 'Major in Mobile and Web Applications',
  school: 'National University – Manila',
  period: 'Aug 2022 – Sep 2026'
};

/* ------------------------------------------------------------------ */
/* Certifications                                                      */
/* ------------------------------------------------------------------ */

export type CertTopic = 'Web & APIs' | 'Data' | 'Security' | 'UX';

export interface Certification { title: string; issuer?: string; date: string; topic: CertTopic; image?: string; }

export const CERT_TOPIC_ICONS: Record<CertTopic, string> = {
  'Web & APIs': 'fa-solid fa-code',
  Data: 'fa-solid fa-chart-simple',
  Security: 'fa-solid fa-shield-halved',
  UX: 'fa-solid fa-pen-ruler'
};

export const CERTIFICATIONS: Certification[] = [
  { title: 'Building RESTful APIs with Node.js and Express', issuer: 'LinkedIn Learning', date: 'Sep 2026', image: 'certs/building-restful-apis-nodejs-express.png', topic: 'Web & APIs' },
  { title: 'Designing RESTful APIs', issuer: 'LinkedIn Learning', date: 'Sep 2026', image: 'certs/designing-restful-apis.png', topic: 'Web & APIs' },
  { title: 'Node.js: Securing RESTful APIs', issuer: 'LinkedIn Learning', date: 'Sep 2026', image: 'certs/nodejs-securing-restful-apis.png', topic: 'Web & APIs' },
  { title: 'React: State Management', issuer: 'LinkedIn Learning', date: 'Sep 2026', image: 'certs/react-state-management.png', topic: 'Web & APIs' },
  { title: 'Building Modern Projects with React', issuer: 'LinkedIn Learning', date: 'Sep 2026', image: 'certs/building-modern-projects-react.png', topic: 'Web & APIs' },
  { title: 'Database Design Fundamentals', date: 'Sep 2026', topic: 'Data' },
  { title: 'HTML, CSS, and JavaScript: Building the Web', issuer: 'LinkedIn Learning', date: 'Sep 2026', image: 'certs/html-css-javascript-building-the-web.png', topic: 'Web & APIs' },
  { title: 'Database Foundations: Application Development', issuer: 'LinkedIn Learning', date: 'Sep 2026', image: 'certs/database-foundations-app-dev.png', topic: 'Data' },
  { title: 'Git Workflows', date: 'Sep 2026', topic: 'Web & APIs' },
  { title: 'Cybersecurity Foundations', issuer: 'LinkedIn Learning', date: 'Sep 2026', image: 'certs/cybersecurity-foundations.png', topic: 'Security' },
  { title: 'The Cybersecurity Threat Landscape', issuer: 'LinkedIn Learning', date: 'Sep 2026', image: 'certs/cybersecurity-threat-landscape.png', topic: 'Security' },
  { title: 'Artificial Intelligence for Cybersecurity', issuer: 'LinkedIn Learning', date: 'Sep 2026', image: 'certs/ai-for-cybersecurity.png', topic: 'Security' },
  { title: 'Cybersecurity Awareness: Cybersecurity Terminology', issuer: 'LinkedIn Learning', date: 'Sep 2026', image: 'certs/cybersecurity-terminology.png', topic: 'Security' },
  { title: 'Foundations of User Experience (UX) Design', issuer: 'Google · Coursera', date: 'Apr 2023', topic: 'UX', image: 'certs/google-ux-foundations.jpg' },
  { title: 'Data Analysis with Python', issuer: 'Cognitive Class · IBM', date: 'Apr 2023', topic: 'Data', image: 'certs/data-analysis-python.png' },
  { title: 'Data Analytics Foundations', issuer: 'DataSense Analytics', date: 'Mar 2023', topic: 'Data', image: 'certs/data-analytics-foundations.jpg' },
  { title: 'Data Analytics Using Excel', issuer: 'Great Learning', date: 'Mar 2023', topic: 'Data', image: 'certs/data-analytics-excel.jpg' },
  { title: 'UI / UX for Beginners', issuer: 'Great Learning', date: 'Mar 2023', topic: 'UX', image: 'certs/ui-ux-beginners.jpg' },
  { title: 'Principles of Python Programming', issuer: 'Kakakompyuter mo yan workshop', date: 'Mar 2023', topic: 'Data', image: 'certs/principles-python-programming.png' }
];
