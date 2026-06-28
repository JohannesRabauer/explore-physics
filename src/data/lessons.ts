export interface Lesson {
  slug: string;
  title: { de: string; en: string };
  description: { de: string; en: string };
  grade: number;
}

export const lessons: Lesson[] = [
  {
    slug: 'magnets',
    title: { de: 'Magnetismus', en: 'Magnetism' },
    description: { de: 'Erforsche wie Magnete sich anziehen und abstoßen', en: 'Explore how magnets attract and repel' },
    grade: 5,
  },
  {
    slug: 'sound-waves',
    title: { de: 'Schallwellen', en: 'Sound Waves' },
    description: { de: 'Sieh wie Schall durch die Luft reist', en: 'See how sound travels through the air' },
    grade: 6,
  },
  {
    slug: 'light-refraction',
    title: { de: 'Lichtbrechung', en: 'Light Refraction' },
    description: { de: 'Beobachte wie Licht seine Richtung ändert', en: 'Observe how light changes direction' },
    grade: 7,
  },
  {
    slug: 'circuits',
    title: { de: 'Stromkreise', en: 'Electric Circuits' },
    description: { de: 'Baue und teste einfache Stromkreise', en: 'Build and test simple circuits' },
    grade: 8,
  },
  {
    slug: 'pendulum',
    title: { de: 'Das Pendel', en: 'The Pendulum' },
    description: { de: 'Untersuche Schwingungen und Energieumwandlung', en: 'Investigate oscillations and energy conversion' },
    grade: 9,
  },
  {
    slug: 'waves',
    title: { de: 'Wellenphänomene', en: 'Wave Phenomena' },
    description: { de: 'Interferenz und Beugung sichtbar gemacht', en: 'Visualize interference and diffraction' },
    grade: 10,
  },
  {
    slug: 'projectile-motion',
    title: { de: 'Schiefer Wurf', en: 'Projectile Motion' },
    description: { de: 'Berechne und simuliere Wurfbahnen', en: 'Calculate and simulate trajectories' },
    grade: 11,
  },
  {
    slug: 'double-slit',
    title: { de: 'Doppelspalt-Experiment', en: 'Double-Slit Experiment' },
    description: { de: 'Entdecke die Welle-Teilchen-Dualität', en: 'Discover wave-particle duality' },
    grade: 12,
  },
];

export function getLessonsByGrade(grade: number): Lesson[] {
  return lessons.filter((l) => l.grade === grade);
}

export function getLesson(grade: number, slug: string): Lesson | undefined {
  return lessons.find((l) => l.grade === grade && l.slug === slug);
}

export const grades = [5, 6, 7, 8, 9, 10, 11, 12];
