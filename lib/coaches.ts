// Aero Gym - coach directory (PRD §4.11). Local-first: profiles are
// bundled data, and shortlisting is stored on the device.

export interface Coach {
  id: string;
  name: string;
  role: string;
  image: string;
  rating: number;
  reviews: number;
  years: number;
  price: number;
  availability: string;
  specialties: string[];
  focus: string[];
  certifications: string[];
  bio: string;
}

const PORTRAIT = (id: string) =>
  `https://images.unsplash.com/${id}?w=700&h=900&fit=crop&q=80`;

export const COACHES: Coach[] = [
  {
    id: "ayesha-khan",
    name: "Ayesha Khan",
    role: "Strength and conditioning",
    image: PORTRAIT("photo-1594381898411-846e7d193883"),
    rating: 4.9,
    reviews: 127,
    years: 8,
    price: 45,
    availability: "3 openings this month",
    specialties: ["Squat mechanics", "Beginner strength", "Competition prep"],
    focus: ["Strength", "Technique", "Powerlifting"],
    certifications: ["NSCA-CSCS", "USA Weightlifting Level 1", "First aid and CPR"],
    bio: "Ayesha builds programs around the three main lifts and the technique behind them. She works with lifters returning after a layoff as well as first-time competitors, and keeps every block to a small number of measurable targets so progress is easy to see.",
  },
  {
    id: "daniel-okafor",
    name: "Daniel Okafor",
    role: "Hypertrophy coach",
    image: PORTRAIT("photo-1567013127542-490d757e51fc"),
    rating: 4.8,
    reviews: 94,
    years: 11,
    price: 60,
    availability: "Waitlist for new clients",
    specialties: ["Muscle gain", "Body recomposition", "Plateau breaking"],
    focus: ["Hypertrophy", "Nutrition", "Consistency"],
    certifications: ["NASM-CPT", "Precision Nutrition Level 1", "ISSN sports nutrition"],
    bio: "Daniel has spent a decade coaching intermediate lifters through long, unglamorous hypertrophy blocks. His plans favour a short list of compound lifts, honest weekly volume tracking and a calorie target that survives a busy week.",
  },
  {
    id: "marta-ruiz",
    name: "Marta Ruiz",
    role: "Mobility and return to training",
    image: PORTRAIT("photo-1544005313-94ddf0286df2"),
    rating: 4.9,
    reviews: 61,
    years: 6,
    price: 40,
    availability: "Taking new clients",
    specialties: ["Shoulder rehab", "Hip mobility", "Desk-bound lifters"],
    focus: ["Mobility", "Rehab", "Posture"],
    certifications: ["FMS Level 2", "Sports rehabilitation diploma", "Pilates mat certified"],
    bio: "Marta works with people who want to keep training while something hurts. Sessions start with an assessment, then pair strength work with the mobility drills that actually change range of motion, so nothing has to be paused indefinitely.",
  },
  {
    id: "ravi-menon",
    name: "Ravi Menon",
    role: "Olympic lifting",
    image: PORTRAIT("photo-1571019613454-1cb2f99b2d8b"),
    rating: 4.7,
    reviews: 48,
    years: 9,
    price: 70,
    availability: "2 openings this month",
    specialties: ["Snatch", "Clean and jerk", "Overhead stability"],
    focus: ["Olympic lifts", "Speed", "Technique"],
    certifications: ["IWF Level 2", "NSCA-CSCS", "Barbell club coach"],
    bio: "Ravi coaches the snatch and clean and jerk from the ground up, with video review after every session. He prefers frequent short practices over long grinders and will happily spend a month on the pull before adding weight.",
  },
  {
    id: "elena-petrova",
    name: "Elena Petrova",
    role: "Endurance and fat loss",
    image: PORTRAIT("photo-1550345332-09e3ac987658"),
    rating: 4.8,
    reviews: 83,
    years: 7,
    price: 50,
    availability: "Taking new clients",
    specialties: ["5k to half marathon", "Zone 2 training", "Sustainable fat loss"],
    focus: ["Endurance", "Conditioning", "Habits"],
    certifications: ["UESCA running coach", "ACE-CPT", "Precision Nutrition Level 1"],
    bio: "Elena plans endurance blocks around the time a client actually has. Most programs mix two quality sessions with easy aerobic work and a strength day, and she tracks pace and effort rather than body weight alone.",
  },
];

export const SHORTLIST_STORAGE_KEY = "workout-coach-shortlist";

export function getShortlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SHORTLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function toggleShortlist(id: string): string[] {
  const current = getShortlist();
  const next = current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id];
  try {
    window.localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable - keep the in-memory result */
  }
  return next;
}

export function getCoach(id: string): Coach | undefined {
  return COACHES.find((coach) => coach.id === id);
}
