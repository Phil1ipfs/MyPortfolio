import { PORTFOLIO_KNOWLEDGE as K } from '../knowledge/portfolio-knowledge';
import { ChatBullet, ChatEngine, ChatLink, ChatReply } from './chat-types';
import type { Project } from '../../data/portfolio.data';

/**
 * In-browser answer engine: intent detection + lookups over PORTFOLIO_KNOWLEDGE.
 * It never generates facts — every sentence is assembled from the knowledge base,
 * and anything it can't find is reported as "not available".
 */

export const SUGGESTED_QUESTIONS = [
  'What projects has Phillip built?',
  'Tell me about Literexia.',
  'What technologies does Phillip use?',
  'Does Phillip have React experience?',
  'How can I contact Phillip?'
];

const NAME = K.profile.firstName;

/* ------------------------------------------------------------------ */
/* Text matching                                                       */
/* ------------------------------------------------------------------ */

function normalize(input: string): string {
  return ` ${input
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[?!,;:()"“”]/g, ' ')
    .replace(/\.(?=\s|$)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Whole-term match that treats + # . as part of a word (c++, c#, node.js). */
function hasTerm(text: string, term: string): boolean {
  return new RegExp(`(^|[^a-z0-9+#.])${escapeRe(term)}(?=$|[^a-z0-9+#.])`).test(text);
}

const any = (text: string, terms: string[]) => terms.some(t => hasTerm(text, t));

/* ------------------------------------------------------------------ */
/* Technology vocabulary                                               */
/* ------------------------------------------------------------------ */

/** Canonical name → ways people type it. Only used to *find* techs; evidence comes from the data. */
const TECH_ALIASES: Record<string, string[]> = {
  React: ['react', 'reactjs', 'react.js', 'react js'],
  Angular: ['angular'],
  TypeScript: ['typescript', 'ts'],
  JavaScript: ['javascript', 'js'],
  HTML: ['html', 'html5'],
  CSS: ['css', 'css3'],
  Tailwind: ['tailwind', 'tailwindcss', 'tailwind css'],
  'Node.js': ['node', 'nodejs', 'node.js', 'node js'],
  'Express.js': ['express', 'expressjs', 'express.js'],
  'REST APIs': ['rest api', 'rest apis', 'restful', 'rest'],
  Authentication: ['authentication', 'auth'],
  JWT: ['jwt', 'json web token', 'json web tokens'],
  CRUD: ['crud'],
  MongoDB: ['mongodb', 'mongo'],
  PostgreSQL: ['postgresql', 'postgres'],
  MySQL: ['mysql'],
  SQLite: ['sqlite'],
  Supabase: ['supabase'],
  AWS: ['aws', 'amazon web services'],
  'AWS S3': ['s3', 'aws s3'],
  'AWS EC2': ['ec2', 'aws ec2'],
  'AWS Amplify': ['amplify', 'aws amplify'],
  Vercel: ['vercel'],
  Docker: ['docker'],
  Flutter: ['flutter'],
  Dart: ['dart'],
  WordPress: ['wordpress', 'word press'],
  Elementor: ['elementor'],
  Figma: ['figma'],
  Git: ['git'],
  Java: ['java'],
  JavaFX: ['javafx'],
  Python: ['python'],
  PHP: ['php'],
  'C#': ['c#', 'csharp', 'c sharp'],
  'C++': ['c++', 'cpp'],
  Kotlin: ['kotlin'],
  'OpenAI API': ['openai', 'open ai', 'openai api', 'chatgpt', 'gpt'],
  ElevenLabs: ['elevenlabs', 'eleven labs'],
  Postman: ['postman'],
  'VS Code': ['vs code', 'vscode'],
  'Android Studio': ['android studio'],
  'Adobe Illustrator': ['illustrator', 'adobe illustrator'],
  Blender: ['blender'],
  Unity: ['unity'],
  Claude: ['claude'],
  'Socket.IO': ['socket.io', 'socketio', 'socket io', 'websocket', 'websockets'],
  Cloudinary: ['cloudinary'],
  Sequelize: ['sequelize'],
  Vite: ['vite'],
  // Topic rather than a tool: evidence also comes from project descriptions (see TEXT_TOPICS).
  AI: ['ai', 'artificial intelligence', 'machine learning', 'llm', 'llms']
};

/** Topics whose project evidence is found in project text, not just the technology list. */
const TEXT_TOPICS: Record<string, string[]> = {
  AI: ['ai', 'ai-powered', 'ai-driven', 'openai', 'artificial intelligence', 'deep learning']
};

/** Map a technology string from the data to its canonical name. */
function canon(tech: string): string {
  const t = tech.toLowerCase();
  for (const [name, aliases] of Object.entries(TECH_ALIASES)) {
    if (name.toLowerCase() === t || aliases.includes(t)) return name;
  }
  return tech;
}

function aliasesOf(name: string): string[] {
  return TECH_ALIASES[name] ?? [name.toLowerCase()];
}

interface TechEvidence {
  name: string;
  categories: string[];
  otherTool: boolean;
  projects: Project[];
  certs: string[];
  experience: string[];
}

function evidenceFor(name: string): TechEvidence {
  const aliases = aliasesOf(name);
  return {
    name,
    categories: K.skills.categories.filter(c => c.items.some(i => canon(i) === name)).map(c => c.title),
    otherTool: K.skills.other.some(t => canon(t) === name),
    projects: K.projects.filter(
      p =>
        p.technologies.some(t => canon(t) === name) ||
        (TEXT_TOPICS[name] && any(normalize(`${p.tagline} ${p.summary} ${p.overview} ${p.technologies.join(' ')}`), TEXT_TOPICS[name]))
    ),
    certs: K.certifications.filter(c => any(normalize(c.title), aliases)).map(c => c.title),
    experience: K.experience.filter(e => any(normalize(e.points.join(' ')), aliases)).map(e => `${e.role} at ${e.org}`)
  };
}

const hasEvidence = (e: TechEvidence) =>
  e.categories.length > 0 || e.otherTool || e.projects.length > 0 || e.certs.length > 0 || e.experience.length > 0;

function techsIn(q: string): TechEvidence[] {
  const found = Object.keys(TECH_ALIASES).filter(name => any(q, aliasesOf(name)));
  // Prefer the more specific match ("AWS S3" over "AWS", "Node.js" over "JavaScript"-ish overlaps).
  const specific = found.filter(n => !found.some(o => o !== n && o.startsWith(n + ' ')));
  return specific.map(evidenceFor).filter(hasEvidence);
}

/* ------------------------------------------------------------------ */
/* Project lookup                                                      */
/* ------------------------------------------------------------------ */

const PROJECT_ALIASES: Record<string, string[]> = {
  literexia: ['literexia', 'dyslexia', 'dyslexic', 'capstone'],
  'bulldog-exchange': ['bulldog', 'bulldog exchange', 'bulldogs exchange'],
  pinkventory: ['pinkventory', 'pinkventorys', 'inventory'],
  myriad: ['myriad', 'janna', 'lgbtq', 'lgbtqia', 'lgbtqia+', 'padre garcia', 'google play', 'play store', 'published app'],
  communify: ['communify'],
  ecodex: ['ecodex', 'eco dex', 'plant identification'],
  amber: ['amber'],
  'photo-booth': ['photo booth', 'photobooth'],
  'resource-management-sim': ['resource management', 'simulation game', 'unity game', '3d game', 'game'],
  'story-book-app': ['story book', 'storybook'],
  'nu-learn': ['nu-learn', 'nu learn', 'e-learning', 'elearning'],
  afkar: ['afkar'],
  reusify: ['reusify'],
  everyjuana: ["everyjuan'a", 'everyjuana', 'every juan', 'everyjuan'],
  'the-pizzeria': ['pizzeria', 'pizza']
};

function projectsIn(q: string): Project[] {
  return K.projects.filter(p => any(q, PROJECT_ALIASES[p.slug] ?? [p.name.toLowerCase()]));
}

const projectLink = (p: Project): ChatLink => ({
  kind: 'project',
  slug: p.slug,
  label: p.caseStudy ? `${p.name} case study` : `View ${p.name}`
});

/* ------------------------------------------------------------------ */
/* Shared links                                                        */
/* ------------------------------------------------------------------ */

const CONTACT_LINKS: ChatLink[] = [
  { kind: 'external', label: 'Email', href: `mailto:${K.contact.email}`, icon: 'fa-solid fa-envelope' },
  { kind: 'external', label: 'LinkedIn', href: K.contact.linkedin, icon: 'fa-brands fa-linkedin-in' },
  { kind: 'external', label: 'GitHub', href: K.contact.github, icon: 'fa-brands fa-github' },
  { kind: 'external', label: 'Download CV', href: K.contact.cv, icon: 'fa-solid fa-arrow-down', download: true },
  { kind: 'section', label: 'Contact form', section: 'contact' }
];

const section = (label: string, id: string): ChatLink => ({ kind: 'section', label, section: id });

/* ------------------------------------------------------------------ */
/* Answer builders                                                     */
/* ------------------------------------------------------------------ */

function aboutReply(): ChatReply {
  const job = K.experience[0];
  return {
    text: `${K.profile.name} is a ${K.profile.role} based in ${K.profile.location}. ${K.profile.summary}`,
    bullets: [
      { text: `Most recent role: ${job.role} at ${job.org} (${job.period})` },
      { text: `Education: ${K.education.degree}, ${K.education.major} — ${K.education.school}` },
      { text: `${K.projects.length} projects in his portfolio, from Flutter apps to full-stack web systems` }
    ],
    links: [section('About', 'about'), section('Projects', 'projects')]
  };
}

function projectsReply(): ChatReply {
  const featured = K.projects.filter(p => p.featured);
  const rest = K.projects.filter(p => !p.featured);
  return {
    text: `${NAME} has ${K.projects.length} projects in his portfolio. His featured work:`,
    bullets: [
      ...featured.map(p => ({ text: `${p.name} — ${p.tagline}`, link: projectLink(p) })),
      { text: `Also: ${rest.map(p => p.name).join(', ')}.` }
    ],
    links: [section('Browse all projects', 'projects')],
    suggestions: ['Tell me about Literexia.', 'Tell me about Myriad.', 'Which projects use Flutter?']
  };
}

/** Project copy is written in first person for the site; the assistant speaks about Phillip. */
const thirdPerson = (text: string) => text.replace(/\bMy\b/g, `${NAME}'s`).replace(/\bmy\b/g, 'his');

function projectReply(p: Project): ChatReply {
  const bullets: ChatBullet[] = [
    { text: `Category: ${p.categories.join(', ')}` },
    { text: `Tech: ${p.technologies.join(', ')}` }
  ];
  const features = p.caseStudy?.features?.slice(0, 3);
  if (features?.length) bullets.push({ text: `Highlights: ${thirdPerson(features.join('; '))}` });
  if (p.caseStudy?.outcome) bullets.push({ text: `Outcome: ${thirdPerson(p.caseStudy.outcome)}` });

  const links: ChatLink[] = [projectLink(p)];
  if (p.liveUrl) links.push({ kind: 'external', label: p.liveLabel ?? 'Live demo', href: p.liveUrl, icon: 'fa-solid fa-arrow-up-right-from-square' });
  if (p.repos?.length) links.push({ kind: 'external', label: 'GitHub', href: p.repos[0].url, icon: 'fa-brands fa-github' });

  return { text: `${p.name} — ${p.tagline}. ${thirdPerson(p.summary)}`, bullets, links };
}

function multiProjectReply(projects: Project[]): ChatReply {
  if (projects.length === 1) return projectReply(projects[0]);
  return {
    text: `Here are the projects that match:`,
    bullets: projects.slice(0, 5).map(p => ({ text: `${p.name} — ${thirdPerson(p.summary)}`, link: projectLink(p) })),
    links: [section('All projects', 'projects')]
  };
}

function techReply(evidence: TechEvidence[], listQuestion: boolean): ChatReply {
  if (evidence.length > 1) {
    return {
      text: `Yes — ${NAME}'s portfolio covers all of these:`,
      bullets: evidence.map(e => ({ text: `${e.name}: ${techSummary(e)}` })),
      links: [section('Tech Stack', 'tech-stack')]
    };
  }
  const e = evidence[0];
  const n = e.projects.length;
  const inProjects = n ? `${n} project${n > 1 ? 's' : ''}` : '';

  const bullets: ChatBullet[] = e.projects
    .slice(0, 5)
    .map(p => ({ text: `${p.name} — ${p.tagline}`, link: projectLink(p) }));
  e.experience.forEach(x => bullets.push({ text: `Used in his role as ${x}` }));
  e.certs.slice(0, 3).forEach(c => bullets.push({ text: `Certification: ${c}` }));

  let text: string;
  if (listQuestion && n) {
    text = `${NAME} has used ${e.name} in ${inProjects}:`;
  } else if (e.categories.length) {
    text = `Yes. He lists ${e.name} in his ${e.categories.join(' and ')} skills${n ? `, and has used it in ${inProjects}:` : '.'}`;
  } else if (e.otherTool) {
    text = `Yes. ${e.name} is among the other tools he has worked with${n ? ` — used in ${inProjects}:` : '.'}`;
  } else if (n) {
    text = `Yes. He has worked with ${e.name} in ${inProjects}:`;
  } else {
    text = `Yes. He has worked with ${e.name}:`;
  }
  return { text, bullets, links: [section('Tech Stack', 'tech-stack')] };
}

function techSummary(e: TechEvidence): string {
  const parts: string[] = [];
  if (e.categories.length) parts.push(`${e.categories.join(', ')} skill`);
  if (e.projects.length) parts.push(`used in ${e.projects.map(p => p.name).join(', ')}`);
  if (e.experience.length) parts.push(`used in his role as ${e.experience.join(', ')}`);
  if (!parts.length && e.otherTool) parts.push('listed among other tools');
  return parts.join('; ');
}

function skillsReply(): ChatReply {
  return {
    text: `${NAME} works across the stack. Here's how his skills are organized:`,
    bullets: K.skills.categories.map(c => ({ text: `${c.title}: ${c.items.join(', ')}` })),
    links: [section('Tech Stack', 'tech-stack')],
    suggestions: ['Does Phillip have React experience?', 'Which projects use Flutter?']
  };
}

function experienceReply(): ChatReply {
  const bullets: ChatBullet[] = [];
  for (const job of K.experience) {
    bullets.push({ text: `${job.role} — ${job.org} (${job.period})` });
    job.points.forEach(p => bullets.push({ text: p }));
  }
  return {
    text: `${NAME}'s professional experience:`,
    bullets,
    links: [section('Experience', 'experience')],
    suggestions: ['What about leadership and hackathons?', 'Where did Phillip study?']
  };
}

function educationReply(): ChatReply {
  const ed = K.education;
  return {
    text: `${NAME} studied for a ${ed.degree}, ${ed.major}, at ${ed.school} (${ed.period}).`,
    links: [section('Education', 'experience')]
  };
}

function certsReply(q: string): ChatReply {
  const linkedIn = hasTerm(q, 'linkedin learning');
  const list = linkedIn ? K.certifications.filter(c => c.issuer === 'LinkedIn Learning') : K.certifications;
  return {
    text: linkedIn
      ? `${NAME} has ${list.length} LinkedIn Learning certificates:`
      : `${NAME} has ${list.length} certifications and courses. The most recent:`,
    bullets: list.slice(0, linkedIn ? list.length : 6).map(c => ({
      text: `${c.title}${c.issuer ? ` — ${c.issuer}` : ''} (${c.date})`
    })),
    links: [section('Certifications', 'certifications')]
  };
}

function eventsReply(): ChatReply {
  return {
    text: `${NAME} is active in student tech communities and hackathons:`,
    bullets: [
      ...K.events.map(e => ({ text: `${e.title} — ${e.org} (${e.date})` })),
      ...K.organizations.map(o => ({ text: `${o.role} — ${o.org}` }))
    ],
    links: [section('Experience', 'experience')]
  };
}

function contactReply(q: string): ChatReply {
  const wantsCv = any(q, ['cv', 'resume', 'résumé']);
  return {
    text: wantsCv
      ? `You can download ${NAME}'s CV below, or reach him directly:`
      : `You can reach ${NAME} at ${K.contact.email}, or through LinkedIn and GitHub. There's also a contact form on this page.`,
    links: CONTACT_LINKS
  };
}

function availabilityReply(): ChatReply {
  return {
    text: `${NAME} is open to new opportunities and collaborations. The best way to reach him is by email or LinkedIn.`,
    links: CONTACT_LINKS
  };
}

function notAvailable(topic?: string): ChatReply {
  return {
    text: topic
      ? `That information isn't available in ${NAME}'s portfolio — I don't have anything about ${topic}. I can only answer from his resume and portfolio.`
      : `That information isn't available in ${NAME}'s portfolio. I can tell you about his projects, skills, experience, education, certifications, or how to contact him.`,
    suggestions: SUGGESTED_QUESTIONS.slice(0, 4)
  };
}

/* ------------------------------------------------------------------ */
/* Intent routing                                                      */
/* ------------------------------------------------------------------ */

/** Words that look like an object of "does he use/know X" but aren't a technology. */
const GENERIC_WORDS = new Set(
  'it that this them what which any anything work professional tools tool frameworks framework languages language databases database technologies technology tech cloud backend frontend mobile web design apis api'.split(' ')
);

const STOPWORDS = new Set(
  'what which who whom whose where when why how does did do has have had is are was were the a an and or of for to in on at with about tell me his him he phillip phillip\'s casingal john can could would should please any some it this that there their them you your yes no'.split(' ')
);

function keywordSearch(q: string): Project[] {
  const words = q.split(' ').filter(w => w.length >= 4 && !STOPWORDS.has(w));
  if (!words.length) return [];
  return K.projects.filter(p => {
    const hay = normalize(`${p.name} ${p.tagline} ${p.summary} ${p.overview}`);
    return words.some(w => hasTerm(hay, w));
  });
}

export class RuleBasedChatEngine implements ChatEngine {
  async reply(question: string): Promise<ChatReply> {
    const q = normalize(question);

    if (/^ (hi|hello|hey|yo|good (morning|afternoon|evening))( there)?( phillip)? $/.test(q)) {
      return {
        text: `Hi! I can tell you about ${NAME}'s projects, skills, experience, education and certifications — or how to get in touch.`,
        suggestions: SUGGESTED_QUESTIONS
      };
    }
    if (any(q, ['thanks', 'thank you', 'ty', 'thx'])) {
      return { text: `You're welcome! Anything else you'd like to know about ${NAME}?`, suggestions: SUGGESTED_QUESTIONS.slice(0, 3) };
    }

    // Certifications phrased with "LinkedIn Learning" must not fall into the contact intent.
    if (hasTerm(q, 'linkedin learning')) return certsReply(q);

    if (any(q, ['contact', 'email', 'e-mail', 'reach', 'hire', 'hiring', 'linkedin', 'github', 'get in touch', 'message him', 'phone', 'cv', 'resume', 'résumé', 'work with', 'collaborate'])) {
      return contactReply(q);
    }

    const projects = projectsIn(q);
    const techs = techsIn(q);
    const asksAboutTech = /\b(experience (with|in)|know|knows|familiar|use|uses|used|using|work(ed|s)? with|skilled|proficient|built with|made with|which projects|what projects)\b/.test(q);

    // "Which projects use Flutter?" / "Does he know React?" → technology answer.
    if (techs.length && (asksAboutTech || !projects.length)) return techReply(techs, /^ (which|what) /.test(q));
    if (projects.length) return multiProjectReply(projects);

    // Asked about a specific technology we have no record of.
    const unknownTech = q.match(/\b(?:experience (?:with|in)|know|knows|familiar with|use|uses|used|worked with|skilled in|proficient in) ([a-z0-9+#.\- ]{2,30}?)(?: experience)? $/);
    if (unknownTech && !GENERIC_WORDS.has(unknownTech[1].trim())) {
      return notAvailable(`${NAME} working with "${unknownTech[1].trim()}"`);
    }
    if (/\b(experience) $/.test(q) && /\b(does|has|have)\b/.test(q) && !any(q, ['work experience', 'professional experience'])) {
      const subject = q.replace(/.*\b(have|has)\b/, '').replace(/experience $/, '').trim();
      if (subject && !GENERIC_WORDS.has(subject)) return notAvailable(`${NAME} working with "${subject}"`);
    }

    if (any(q, ['educat', 'education', 'school', 'university', 'college', 'degree', 'study', 'studied', 'studies', 'student', 'graduate', 'graduated', 'bsit', 'major'])) {
      return educationReply();
    }
    if (any(q, ['certification', 'certifications', 'certificate', 'certificates', 'certified', 'course', 'courses', 'training', 'credential', 'credentials'])) {
      return certsReply(q);
    }
    if (any(q, ['hackathon', 'hackathons', 'ideathon', 'hackercup', 'innolympics', 'award', 'awards', 'achievement', 'achievements', 'won', 'win', 'competition', 'competitions', 'leadership', 'leader', 'organization', 'organizations', 'club', 'clubs', 'gdg', 'gdsc', 'volunteer', 'extracurricular', 'events'])) {
      return eventsReply();
    }
    if (any(q, ['available', 'availability', 'open to', 'opportunity', 'opportunities', 'freelance'])) {
      return availabilityReply();
    }
    if (any(q, ['experience', 'job', 'jobs', 'employment', 'employed', 'intern', 'internship', 'company', 'companies', 'career', 'easy bus', 'worked', 'work history'])) {
      return experienceReply();
    }
    if (any(q, ['project', 'projects', 'built', 'build', 'portfolio', 'apps', 'app', 'case study', 'case studies', 'made', 'created'])) {
      return projectsReply();
    }
    if (any(q, ['tech', 'technology', 'technologies', 'stack', 'skill', 'skills', 'language', 'languages', 'tool', 'tools', 'framework', 'frameworks', 'database', 'databases', 'cloud', 'backend', 'frontend', 'deployment', 'devops', 'api', 'apis'])) {
      return skillsReply();
    }
    if (any(q, ['who', 'about', 'introduce', 'introduction', 'background', 'summary', 'yourself'])) {
      return aboutReply();
    }
    if (any(q, ['where', 'based', 'location', 'located', 'live', 'lives', 'from'])) {
      return {
        text: `${NAME} is based in ${K.profile.location}.`,
        links: CONTACT_LINKS.slice(0, 3)
      };
    }

    const hits = keywordSearch(q);
    if (hits.length) return multiProjectReply(hits);

    return notAvailable();
  }
}
