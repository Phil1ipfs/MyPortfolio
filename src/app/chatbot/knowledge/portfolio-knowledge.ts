import {
  CERTIFICATIONS,
  EDUCATION,
  EVENTS,
  EXPERIENCE,
  ORGANIZATIONS,
  OTHER_TOOLS,
  PROFILE,
  PROJECTS,
  TECH_STACK
} from '../../data/portfolio.data';

/**
 * The assistant's knowledge base. Everything is derived from the portfolio
 * content (portfolio.data.ts), which is itself sourced from the CV — so the
 * chatbot can never say something the site doesn't.
 *
 * If this is ever sent to an LLM as context, send this object (serialized),
 * not free-form text.
 */
export const PORTFOLIO_KNOWLEDGE = {
  profile: {
    name: `${PROFILE.firstName} ${PROFILE.lastName}`,
    firstName: 'Phillip',
    role: PROFILE.role,
    location: PROFILE.location,
    /** CV "Summary" section, verbatim in substance. */
    summary:
      'Mobile and web developer with hands-on experience in software development. A strong communicator and leader with a track record of contributing in team-based and organizational settings, eager to grow his expertise and make a meaningful impact in the field.'
  },
  projects: PROJECTS,
  skills: {
    categories: TECH_STACK,
    other: OTHER_TOOLS
  },
  experience: EXPERIENCE,
  organizations: ORGANIZATIONS,
  events: EVENTS,
  education: EDUCATION,
  certifications: CERTIFICATIONS,
  contact: {
    email: PROFILE.email,
    linkedin: PROFILE.linkedin,
    github: PROFILE.github,
    website: PROFILE.website,
    cv: PROFILE.cv
  }
} as const;

export type PortfolioKnowledge = typeof PORTFOLIO_KNOWLEDGE;
