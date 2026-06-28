export interface Lesson {
  slug: string;
  title: { de: string; en: string };
  description: { de: string; en: string };
  grade: number;
}

export const lessons: Lesson[] = [
  // Grade 5
  { slug: 'magnets', grade: 5, title: { de: 'Magnetismus', en: 'Magnetism' }, description: { de: 'Erforsche wie Magnete sich anziehen und abstoßen', en: 'Explore how magnets attract and repel' } },
  { slug: 'speed-distance-time', grade: 5, title: { de: 'Geschwindigkeit messen', en: 'Measuring Speed' }, description: { de: 'Verstehe den Zusammenhang zwischen Weg, Zeit und Geschwindigkeit', en: 'Understand the relationship between distance, time, and speed' } },
  { slug: 'friction-surface', grade: 5, title: { de: 'Reibung auf verschiedenen Oberflächen', en: 'Friction on Different Surfaces' }, description: { de: 'Warum rutscht man auf Eis, aber nicht auf Gummi?', en: 'Why do you slide on ice but not on rubber?' } },

  // Grade 6
  { slug: 'sound-waves', grade: 6, title: { de: 'Schallwellen', en: 'Sound Waves' }, description: { de: 'Sieh wie Schall durch die Luft reist', en: 'See how sound travels through the air' } },
  { slug: 'free-fall', grade: 6, title: { de: 'Freier Fall', en: 'Free Fall' }, description: { de: 'Fallen schwere Dinge schneller? Galileos berühmtes Experiment!', en: 'Do heavy things fall faster? Galileo\'s famous experiment!' } },
  { slug: 'friction-race', grade: 6, title: { de: 'Reibungs-Rennen', en: 'Friction Race' }, description: { de: 'Welches Material rutscht am schnellsten die Rampe hinunter?', en: 'Which material slides down the ramp fastest?' } },

  // Grade 7
  { slug: 'light-refraction', grade: 7, title: { de: 'Lichtbrechung', en: 'Light Refraction' }, description: { de: 'Beobachte wie Licht seine Richtung ändert', en: 'Observe how light changes direction' } },
  { slug: 'inclined-plane', grade: 7, title: { de: 'Schiefe Ebene', en: 'Inclined Plane' }, description: { de: 'Hangabtriebskraft und Reibung an der schiefen Ebene', en: 'Forces and friction on an inclined plane' } },
  { slug: 'rolling-vs-sliding', grade: 7, title: { de: 'Rollen vs. Gleiten', en: 'Rolling vs. Sliding' }, description: { de: 'Warum haben Räder weniger Reibung als Kufen?', en: 'Why do wheels have less friction than runners?' } },

  // Grade 8
  { slug: 'circuits', grade: 8, title: { de: 'Stromkreise', en: 'Electric Circuits' }, description: { de: 'Baue und teste einfache Stromkreise', en: 'Build and test simple circuits' } },
  { slug: 'acceleration', grade: 8, title: { de: 'Beschleunigung (F=ma)', en: 'Acceleration (F=ma)' }, description: { de: 'Wie Kraft, Masse und Beschleunigung zusammenhängen', en: 'How force, mass, and acceleration are connected' } },
  { slug: 'braking-distance', grade: 8, title: { de: 'Bremsweg', en: 'Braking Distance' }, description: { de: 'Reaktionsweg + Bremsweg = Anhalteweg', en: 'Reaction distance + braking distance = stopping distance' } },

  // Grade 9
  { slug: 'pendulum', grade: 9, title: { de: 'Das Pendel', en: 'The Pendulum' }, description: { de: 'Untersuche Schwingungen und Energieumwandlung', en: 'Investigate oscillations and energy conversion' } },
  { slug: 'terminal-velocity', grade: 9, title: { de: 'Endgeschwindigkeit & Luftwiderstand', en: 'Terminal Velocity & Air Resistance' }, description: { de: 'Warum werden fallende Objekte nicht unendlich schnell?', en: 'Why don\'t falling objects accelerate forever?' } },
  { slug: 'planetary-gravity', grade: 9, title: { de: 'Schwerkraft auf anderen Planeten', en: 'Gravity on Other Planets' }, description: { de: 'Wie hoch kannst du auf dem Mond springen?', en: 'How high can you jump on the Moon?' } },

  // Grade 10
  { slug: 'waves', grade: 10, title: { de: 'Wellenphänomene', en: 'Wave Phenomena' }, description: { de: 'Interferenz und Beugung sichtbar gemacht', en: 'Visualize interference and diffraction' } },
  { slug: 'orbital-mechanics', grade: 10, title: { de: 'Umlaufbahnen', en: 'Orbital Mechanics' }, description: { de: 'Warum fallen Satelliten nicht herunter?', en: 'Why don\'t satellites fall down?' } },

  // Grade 11
  { slug: 'projectile-motion', grade: 11, title: { de: 'Schiefer Wurf', en: 'Projectile Motion' }, description: { de: 'Berechne und simuliere Wurfbahnen', en: 'Calculate and simulate trajectories' } },

  // Grade 12
  { slug: 'double-slit', grade: 12, title: { de: 'Doppelspalt-Experiment', en: 'Double-Slit Experiment' }, description: { de: 'Entdecke die Welle-Teilchen-Dualität', en: 'Discover wave-particle duality' } },
];

export function getLessonsByGrade(grade: number): Lesson[] {
  return lessons.filter((l) => l.grade === grade);
}

export function getLesson(grade: number, slug: string): Lesson | undefined {
  return lessons.find((l) => l.grade === grade && l.slug === slug);
}

export const grades = [5, 6, 7, 8, 9, 10, 11, 12];
