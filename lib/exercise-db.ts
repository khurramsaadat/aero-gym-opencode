// Aero Gym - local exercise database (PRD §4.10: 200+ exercises).
// Each entry: name, category, primary/secondary muscles, equipment.
// Set/rep/weight/duration defaults derive from the category.

import type { Equipment, WorkoutCategory } from "./types";

interface ExerciseEntry {
  name: string;
  category: WorkoutCategory;
  muscles: string[];
  musclesSecondary: string[];
  equipment?: Equipment;
  /** cardio only: default minutes */
  duration?: number;
}

function E(
  name: string,
  category: WorkoutCategory,
  muscles: string[],
  musclesSecondary: string[] = [],
  equipment?: Equipment,
  duration?: number,
): ExerciseEntry {
  return { name, category, muscles, musclesSecondary, equipment, duration };
}

const DB: ExerciseEntry[] = [
  /* ---------------- Biceps ---------------- */
  E("Dumbbell Bicep Curl", "Biceps", ["Biceps"], ["Brachialis"], "Dumbbell"),
  E("Hammer Curl", "Biceps", ["Biceps", "Brachialis"], ["Brachioradialis"], "Dumbbell"),
  E("Concentration Curl", "Biceps", ["Biceps"], [], "Dumbbell"),
  E("Preacher Curl", "Biceps", ["Biceps"], ["Brachialis"], "Machine"),
  E("Barbell Bicep Curl", "Biceps", ["Biceps"], [], "Barbell"),
  E("Incline Dumbbell Curl", "Biceps", ["Biceps", "Long head biceps"], [], "Dumbbell"),
  E("Cable Curl", "Biceps", ["Biceps"], [], "Cable"),
  E("Chin-Up", "Biceps", ["Biceps", "Lats"], ["Rear delts"], "Bodyweight"),
  E("EZ Bar Curl", "Biceps", ["Biceps"], [], "Barbell"),
  E("Zottman Curl", "Biceps", ["Biceps"], ["Forearms"], "Dumbbell"),
  E("Reverse Grip Curl", "Biceps", ["Biceps", "Forearms"], [], "Barbell"),
  E("Cable Hammer Curl", "Biceps", ["Biceps", "Brachialis"], [], "Cable"),
  E("Cross Body Curl", "Biceps", ["Biceps"], ["Brachialis"], "Dumbbell"),
  E("Preacher Hammer Curl", "Biceps", ["Biceps", "Brachialis"], [], "Machine"),
  E("Spider Curl", "Biceps", ["Biceps"], [], "Machine"),
  E("Rope Hammer Curl", "Biceps", ["Biceps"], ["Brachialis"], "Cable"),
  E("Band Curl", "Biceps", ["Biceps"], [], "Band"),
  E("Isometric Curl", "Biceps", ["Biceps"], [], "Dumbbell"),
  E("21s", "Biceps", ["Biceps"], [], "Dumbbell"),
  E("Machine Curl", "Biceps", ["Biceps"], [], "Machine"),
  /* ---------------- Triceps ---------------- */
  E("Tricep Pushdown", "Triceps", ["Triceps"], [], "Cable"),
  E("Skull Crusher", "Triceps", ["Triceps"], [], "Dumbbell"),
  E("Overhead Tricep Extension", "Triceps", ["Triceps", "Long head triceps"], [], "Dumbbell"),
  E("Bench Dip", "Triceps", ["Triceps"], ["Chest"], "Bodyweight"),
  E("Close-Grip Bench Press", "Triceps", ["Triceps", "Chest"], ["Front delts"], "Barbell"),
  E("Tricep Kickback", "Triceps", ["Triceps"], ["Rear delts"], "Dumbbell"),
  E("Cable Overhead Extension", "Triceps", ["Triceps"], [], "Cable"),
  E("Diamond Push-Up", "Triceps", ["Triceps", "Chest"], [], "Bodyweight"),
  E("Rope Pushdown", "Triceps", ["Triceps"], [], "Cable"),
  E("One-Arm Cable Extension", "Triceps", ["Triceps"], [], "Cable"),
  E("Lying Tricep Extension", "Triceps", ["Triceps"], [], "Barbell"),
  E("Reverse-Grip Pushdown", "Triceps", ["Triceps"], [], "Cable"),
  E("Weighted Dip", "Triceps", ["Triceps", "Chest"], ["Front delts"], "Bodyweight"),
  E("Plate Pinch Press", "Triceps", ["Triceps", "Chest"], [], "Other"),
  E("One-Arm Push-Down", "Triceps", ["Triceps"], [], "Cable"),
  E("Dips", "Triceps", ["Triceps", "Chest"], ["Front delts"], "Bodyweight"),
  E("Cable Tricep Extension", "Triceps", ["Triceps"], [], "Cable"),
  /* ---------------- Chest ---------------- */
  E("Bench Press", "Chest", ["Chest"], ["Triceps", "Front delts"], "Barbell"),
  E("Incline Bench Press", "Chest", ["Upper chest"], ["Triceps", "Front delts"], "Barbell"),
  E("Decline Bench Press", "Chest", ["Lower chest"], ["Triceps"], "Barbell"),
  E("Dumbbell Press", "Chest", ["Chest"], ["Triceps"], "Dumbbell"),
  E("Incline Dumbbell Press", "Chest", ["Upper chest"], ["Triceps"], "Dumbbell"),
  E("Chest Fly", "Chest", ["Chest"], [], "Dumbbell"),
  E("Incline Fly", "Chest", ["Upper chest"], [], "Dumbbell"),
  E("Cable Fly", "Chest", ["Chest"], [], "Cable"),
  E("Push-Up", "Chest", ["Chest"], ["Triceps", "Front delts"], "Bodyweight"),
  E("Weighted Push-Up", "Chest", ["Chest"], ["Triceps"], "Bodyweight"),
  E("Chest Press Machine", "Chest", ["Chest"], ["Triceps"], "Machine"),
  E("Pec Deck", "Chest", ["Chest"], [], "Machine"),
  E("Svend Press", "Chest", ["Chest"], ["Triceps"], "Plate"),
  E("Low Cable Fly", "Chest", ["Lower chest"], [], "Cable"),
  E("Single-Arm Press", "Chest", ["Chest"], ["Core"], "Dumbbell"),
  E("Incline Cable Fly", "Chest", ["Upper chest"], [], "Cable"),
  E("Decline Fly", "Chest", ["Lower chest"], [], "Dumbbell"),
  E("Plate Press", "Chest", ["Chest"], ["Triceps"], "Plate"),
  E("Diamond Press", "Chest", ["Chest", "Triceps"], ["Front delts"], "Dumbbell"),
  E("Guillotine Press", "Chest", ["Upper chest"], ["Triceps"], "Barbell"),
  E("Cable Crossover", "Chest", ["Chest"], [], "Cable"),
  E("Single-Arm Cable Fly", "Chest", ["Chest"], [], "Cable"),
  /* ---------------- Back ---------------- */
  E("Pull-Up", "Back", ["Lats"], ["Biceps", "Rear delts"], "Bodyweight"),
  E("Lat Pulldown", "Back", ["Lats"], ["Biceps"], "Machine"),
  E("Bent-Over Row", "Back", ["Lats", "Rhomboids"], ["Biceps", "Rear delts"], "Barbell"),
  E("T-Bar Row", "Back", ["Lats", "Rhomboids"], ["Biceps"], "Machine"),
  E("Seated Cable Row", "Back", ["Lats", "Rhomboids"], ["Biceps", "Rear delts"], "Cable"),
  E("Single-Arm Dumbbell Row", "Back", ["Lats"], ["Biceps", "Rear delts"], "Dumbbell"),
  E("Romanian Deadlift", "Back", ["Spinal erectors", "Hamstrings"], ["Glutes", "Lats"], "Barbell"),
  E("Face Pull", "Back", ["Rear delts", "Rotator cuff"], ["Traps"], "Cable"),
  E("Straight-Arm Pulldown", "Back", ["Lats"], ["Chest", "Triceps"], "Cable"),
  E("Inverted Row", "Back", ["Lats", "Rhomboids"], ["Biceps"], "Bodyweight"),
  E("Machine Row", "Back", ["Lats", "Rhomboids"], ["Biceps"], "Machine"),
  E("Hyperextension", "Back", ["Spinal erectors"], ["Glutes", "Hamstrings"], "Machine"),
  E("Cable Row", "Back", ["Lats", "Rhomboids"], ["Biceps"], "Cable"),
  E("Pull-Over", "Back", ["Lats"], ["Chest", "Triceps"], "Dumbbell"),
  E("Wide-Grip Row", "Back", ["Lats", "Rhomboids"], ["Rear delts"], "Cable"),
  E("Narrow-Grip Pulldown", "Back", ["Lats", "Rhomboids"], ["Biceps"], "Machine"),
  E("Deadlift (Sumo)", "Back", ["Spinal erectors", "Glutes"], ["Hamstrings", "Quads"], "Barbell"),
  E("Good Morning", "Back", ["Spinal erectors"], ["Hamstrings", "Glutes"], "Barbell"),
  E("Rack Pull", "Back", ["Spinal erectors", "Traps"], ["Glutes", "Hamstrings"], "Barbell"),
  E("Meadows Row", "Back", ["Lats", "Rhomboids"], ["Biceps"], "Dumbbell"),
  E("Chest-Supported Row", "Back", ["Lats", "Rhomboids"], ["Rear delts"], "Machine"),
  E("Seated Row Machine", "Back", ["Lats", "Rhomboids"], ["Biceps"], "Machine"),
  E("Pull-Up (Close)", "Back", ["Lats"], ["Biceps"], "Bodyweight"),
  E("Weighted Chin-Up", "Back", ["Lats"], ["Biceps"], "Bodyweight"),
  E("Yates Row", "Back", ["Lats", "Rhomboids"], ["Biceps"], "Barbell"),
  E("Landmine Row", "Back", ["Lats", "Rhomboids"], ["Biceps"], "Barbell"),
  E("Reverse Hyperextension", "Back", ["Glutes", "Hamstrings"], ["Spinal erectors"], "Machine"),
  E("V-Bar Pulldown", "Back", ["Lats"], ["Biceps"], "Machine"),
  E("Reverse-Grip Lat Pulldown", "Back", ["Lats"], ["Biceps"], "Machine"),
  E("Kroc Row", "Back", ["Lats", "Rhomboids"], ["Biceps"], "Dumbbell"),
  /* ---------------- Shoulders ---------------- */
  E("Overhead Press", "Shoulders", ["Shoulders"], ["Triceps"], "Barbell"),
  E("Dumbbell Shoulder Press", "Shoulders", ["Shoulders"], ["Triceps"], "Dumbbell"),
  E("Lateral Raise", "Shoulders", ["Side delts"], ["Front delts"], "Dumbbell"),
  E("Front Raise", "Shoulders", ["Front delts"], ["Side delts"], "Dumbbell"),
  E("Reverse Fly", "Shoulders", ["Rear delts"], ["Rotator cuff"], "Dumbbell"),
  E("Upright Row", "Shoulders", ["Traps", "Side delts"], ["Front delts"], "Barbell"),
  E("Arnold Press", "Shoulders", ["Shoulders"], ["Triceps"], "Dumbbell"),
  E("Shrugs", "Shoulders", ["Traps"], [], "Barbell"),
  E("Barbell Shrug", "Shoulders", ["Traps"], [], "Barbell"),
  E("Cable Lateral Raise", "Shoulders", ["Side delts"], [], "Cable"),
  E("Plate Raise", "Shoulders", ["Side delts", "Front delts"], [], "Plate"),
  E("Cable Face Pull", "Shoulders", ["Rear delts", "Rotator cuff"], ["Traps"], "Cable"),
  E("Dumbbell Shrug", "Shoulders", ["Traps"], [], "Dumbbell"),
  E("Behind-Neck Press", "Shoulders", ["Shoulders"], ["Triceps"], "Barbell"),
  E("Handstand Push-Up", "Shoulders", ["Shoulders"], ["Triceps"], "Bodyweight"),
  E("Cuban Press", "Shoulders", ["Rotator cuff", "Rear delts"], ["Side delts"], "Dumbbell"),
  E("Leaning Lateral Raise", "Shoulders", ["Side delts"], [], "Dumbbell"),
  E("Cable Front Raise", "Shoulders", ["Front delts"], [], "Cable"),
  E("Y-Raise", "Shoulders", ["Rear delts", "Side delts"], ["Rotator cuff"], "Dumbbell"),
  E("Reverse Pec Deck", "Shoulders", ["Rear delts"], [], "Machine"),
  /* ---------------- Legs ---------------- */
  E("Squat", "Legs", ["Quads", "Glutes"], ["Hamstrings", "Spinal erectors"], "Barbell"),
  E("Front Squat", "Legs", ["Quads"], ["Glutes", "Core"], "Barbell"),
  E("Goblet Squat", "Legs", ["Quads", "Glutes"], ["Core"], "Kettlebell"),
  E("Leg Press", "Legs", ["Quads", "Glutes"], ["Hamstrings"], "Machine"),
  E("Hack Squat", "Legs", ["Quads", "Glutes"], ["Hamstrings"], "Machine"),
  E("Lunge", "Legs", ["Quads", "Glutes"], ["Hamstrings"], "Bodyweight"),
  E("Bulgarian Split Squat", "Legs", ["Quads", "Glutes"], ["Hamstrings"], "Bodyweight"),
  E("Leg Curl", "Legs", ["Hamstrings"], [], "Machine"),
  E("Leg Extension", "Legs", ["Quads"], [], "Machine"),
  E("Calf Raise", "Legs", ["Calves"], [], "Machine"),
  E("Step-Up", "Legs", ["Quads", "Glutes"], ["Hamstrings"], "Bodyweight"),
  E("Wall Sit", "Legs", ["Quads"], ["Glutes"], "Bodyweight"),
  E("Sissy Squat", "Legs", ["Quads"], ["Calves"], "Bodyweight"),
  E("Walking Lunge", "Legs", ["Quads", "Glutes"], ["Hamstrings"], "Dumbbell"),
  E("Split Squat", "Legs", ["Quads", "Glutes"], ["Hamstrings"], "Bodyweight"),
  E("Cyclist Squat", "Legs", ["Quads"], ["Glutes"], "Dumbbell"),
  E("Zercher Squat", "Legs", ["Quads", "Glutes"], ["Core"], "Barbell"),
  E("Box Squat", "Legs", ["Quads", "Glutes"], ["Hamstrings"], "Barbell"),
  E("Box Jump", "Legs", ["Quads", "Glutes"], [], "Other"),
  E("Broad Jump", "Legs", ["Quads", "Glutes"], [], "Other"),
  E("Leg Press Calf Raise", "Legs", ["Calves"], [], "Machine"),
  E("Hip Abductor", "Legs", ["Glutes", "Hip abductors"], [], "Machine"),
  E("Hip Adductor", "Legs", ["Hip adductors", "Inner thighs"], [], "Machine"),
  E("Pistol Squat", "Legs", ["Quads"], ["Glutes", "Core"], "Bodyweight"),
  E("Curtsy Lunge", "Legs", ["Glutes", "Quads"], ["Hamstrings"], "Dumbbell"),
  E("Deficit Lunge", "Legs", ["Quads", "Glutes"], ["Hamstrings"], "Dumbbell"),
  E("Prone Leg Curl", "Legs", ["Hamstrings"], [], "Machine"),
  E("Seated Leg Curl", "Legs", ["Hamstrings"], [], "Machine"),
  E("Glute-Ham Raise", "Legs", ["Hamstrings", "Glutes"], [], "Machine"),
  E("Nordic Curl", "Legs", ["Hamstrings"], ["Glutes"], "Bodyweight"),
  /* ---------------- Abs ---------------- */
  E("Crunch", "Abs", ["Abs"], [], "Bodyweight"),
  E("Leg Raise", "Abs", ["Abs", "Hip flexors"], [], "Bodyweight"),
  E("Plank", "Abs", ["Abs", "Core"], [], "Bodyweight", 3),
  E("Russian Twist", "Abs", ["Obliques", "Abs"], [], "Bodyweight"),
  E("Bicycle Crunch", "Abs", ["Abs", "Obliques"], [], "Bodyweight"),
  E("Hanging Leg Raise", "Abs", ["Abs", "Hip flexors"], [], "Bodyweight"),
  E("Cable Crunch", "Abs", ["Abs"], [], "Cable"),
  E("Ab Wheel Rollout", "Abs", ["Abs", "Core"], ["Shoulders"], "Other"),
  E("Mountain Climber", "Abs", ["Abs", "Core"], ["Hip flexors"], "Bodyweight"),
  E("V-Up", "Abs", ["Abs"], ["Hip flexors"], "Bodyweight"),
  E("Flutter Kick", "Abs", ["Abs", "Hip flexors"], [], "Bodyweight"),
  E("Side Plank", "Abs", ["Obliques", "Core"], [], "Bodyweight", 3),
  E("Plank Tap", "Abs", ["Abs", "Obliques"], [], "Bodyweight"),
  E("Dead Bug", "Abs", ["Abs", "Core"], [], "Bodyweight"),
  E("Hollow Hold", "Abs", ["Abs", "Core"], [], "Bodyweight", 3),
  E("Cable Woodchopper", "Abs", ["Obliques", "Abs"], [], "Cable"),
  E("Dragon Flag", "Abs", ["Abs", "Core"], ["Hip flexors"], "Bodyweight"),
  E("Toe Toucher", "Abs", ["Abs", "Hip flexors"], [], "Bodyweight"),
  E("Seated Knee Tuck", "Abs", ["Abs", "Hip flexors"], [], "Machine"),
  E("Plate Twist", "Abs", ["Obliques", "Abs"], [], "Plate"),
  E("Hanging Knee Raise", "Abs", ["Abs", "Hip flexors"], [], "Bodyweight"),
  E("Ab Crunch Machine", "Abs", ["Abs"], [], "Machine"),
  E("Decline Crunch", "Abs", ["Abs"], ["Hip flexors"], "Machine"),
  E("Windshield Wiper", "Abs", ["Obliques", "Abs"], [], "Bodyweight"),
  /* ---------------- Calves ---------------- */
  E("Standing Calf Raise", "Calves", ["Calves"], [], "Machine"),
  E("Seated Calf Raise", "Calves", ["Calves"], [], "Machine"),
  E("Donkey Calf Raise", "Calves", ["Calves"], [], "Bodyweight"),
  E("Tip-Toe Walk", "Calves", ["Calves"], [], "Bodyweight", 5),
  E("Standing Smith Calf Raise", "Calves", ["Calves"], [], "Barbell"),
  /* ---------------- Glutes ---------------- */
  E("Hip Thrust", "Glutes", ["Glutes"], ["Hamstrings"], "Barbell"),
  E("Glute Bridge", "Glutes", ["Glutes"], ["Hamstrings"], "Bodyweight"),
  E("Cable Kickback", "Glutes", ["Glutes"], ["Hamstrings"], "Cable"),
  E("Donkey Kick", "Glutes", ["Glutes"], [], "Bodyweight"),
  E("Clamshell", "Glutes", ["Glutes", "Hip abductors"], [], "Band"),
  E("Fire Hydrant", "Glutes", ["Glutes", "Hip abductors"], [], "Bodyweight"),
  E("Sumo Squat", "Glutes", ["Glutes", "Quads"], ["Hamstrings"], "Barbell"),
  /* ---------------- Quadriceps ---------------- */
  E("Front Foot Elevated Split Squat", "Quadriceps", ["Quads", "Glutes"], ["Hamstrings"], "Bodyweight"),
  E("Belt Squat", "Quadriceps", ["Quads", "Glutes"], ["Hamstrings", "Core"], "Machine"),
  E("Leg Press (Narrow Stance)", "Quadriceps", ["Quads"], [], "Machine"),
  E("Tear Drop Squat", "Quadriceps", ["Quads"], ["Glutes"], "Dumbbell"),
  E("Step-Up (High Box)", "Quadriceps", ["Quads", "Glutes"], ["Hamstrings"], "Bodyweight"),
  E("Leg Extension (Single)", "Quadriceps", ["Quads"], [], "Machine"),
  E("Sled Leg Press", "Quadriceps", ["Quads", "Glutes"], ["Hamstrings"], "Other"),
  /* ---------------- Cardio ---------------- */
  E("Walk", "Cardio", ["Cardio"], [], "Bodyweight", 30),
  E("Run", "Cardio", ["Cardio"], [], "Bodyweight", 30),
  E("Cycling", "Cardio", ["Cardio", "Quads"], [], "Machine", 30),
  E("Rowing", "Cardio", ["Cardio", "Back"], ["Legs", "Arms"], "Machine", 20),
  E("Jump Rope", "Cardio", ["Cardio", "Calves"], [], "Other", 15),
  E("Stair Climber", "Cardio", ["Cardio", "Glutes"], ["Quads"], "Machine", 20),
  E("Elliptical", "Cardio", ["Cardio"], ["Glutes", "Quads"], "Machine", 30),
  E("Swimming", "Cardio", ["Cardio"], ["Back", "Shoulders"], "Other", 30),
  E("Hiking", "Cardio", ["Cardio", "Glutes"], ["Quads"], "Other", 60),
  E("Battle Ropes", "Cardio", ["Cardio", "Shoulders"], ["Arms"], "Other", 15),
  E("High Knees", "Cardio", ["Cardio", "Abs"], [], "Bodyweight", 10),
  E("Burpees", "Cardio", ["Cardio", "Full body"], ["Abs", "Shoulders"], "Bodyweight", 10),
  E("Skipping", "Cardio", ["Cardio", "Calves"], [], "Other", 15),
  E("Treadmill Run", "Cardio", ["Cardio"], ["Quads"], "Machine", 30),
  E("Stationary Bike", "Cardio", ["Cardio", "Quads"], [], "Machine", 30),
  E("Elliptical Trainer", "Cardio", ["Cardio"], ["Glutes", "Quads"], "Machine", 30),
  E("Rowing Machine", "Cardio", ["Cardio", "Back"], ["Legs", "Arms"], "Machine", 20),
  E("Stair Master", "Cardio", ["Cardio", "Glutes"], ["Quads"], "Machine", 20),
  E("Agility Ladder", "Cardio", ["Cardio", "Coordination"], [], "Other", 15),
  E("Sprint Intervals", "Cardio", ["Cardio", "Quads"], ["Glutes"], "Bodyweight", 20),
  E("Assault Bike", "Cardio", ["Cardio"], ["Quads", "Shoulders"], "Machine", 20),
  E("Ski Erg", "Cardio", ["Cardio", "Lats"], ["Shoulders"], "Machine", 15),
  E("Prowler Push", "Cardio", ["Cardio", "Quads"], ["Glutes"], "Other", 10),
  /* ---------------- Full Body ---------------- */
  E("Burpee", "Full Body", ["Full body", "Cardio"], ["Abs", "Shoulders"], "Bodyweight"),
  E("Clean and Press", "Full Body", ["Full body"], ["Quads", "Shoulders"], "Barbell"),
  E("Thruster", "Full Body", ["Quads", "Shoulders"], ["Glutes", "Triceps"], "Barbell"),
  E("Kettlebell Swing", "Full Body", ["Glutes", "Hamstrings"], ["Abs", "Shoulders"], "Kettlebell"),
  E("Deadlift", "Full Body", ["Spinal erectors", "Glutes"], ["Hamstrings", "Lats"], "Barbell"),
  E("Snatch", "Full Body", ["Full body"], ["Shoulders", "Quads"], "Barbell"),
  E("Turkish Get-Up", "Full Body", ["Full body", "Core"], ["Shoulders"], "Kettlebell"),
  E("Farmer's Walk", "Full Body", ["Traps", "Core"], ["Forearms"], "Dumbbell"),
  E("Sled Push", "Full Body", ["Quads", "Glutes"], ["Cardio"], "Other"),
  E("Medicine Ball Slam", "Full Body", ["Abs", "Shoulders"], ["Cardio"], "Other"),
  E("Man Maker", "Full Body", ["Full body", "Cardio"], ["Abs", "Shoulders"], "Dumbbell"),
  E("Sandbag Clean", "Full Body", ["Full body"], ["Quads", "Shoulders"], "Other"),
  E("Tire Flip", "Full Body", ["Glutes", "Spinal erectors"], ["Quads", "Cardio"], "Other"),
  E("Bear Crawl", "Full Body", ["Full body", "Core"], ["Shoulders"], "Bodyweight", 5),
  E("Kettlebell Snatch", "Full Body", ["Glutes", "Shoulders"], ["Abs"], "Kettlebell"),
  E("Wall Ball", "Full Body", ["Quads", "Shoulders"], ["Abs"], "Other"),
];

/* Category defaults for sets/reps/weight/duration. */
const CATEGORY_DEFAULTS: Record<
  string,
  { sets?: number; reps?: number; weight?: number; duration?: number }
> = {
  Biceps: { sets: 3, reps: 10, weight: 12 },
  Triceps: { sets: 3, reps: 10, weight: 20 },
  Chest: { sets: 3, reps: 10, weight: 40 },
  Back: { sets: 3, reps: 8, weight: 40 },
  Shoulders: { sets: 3, reps: 10, weight: 20 },
  Legs: { sets: 3, reps: 10, weight: 50 },
  Abs: { sets: 3, reps: 15, weight: 0 },
  Calves: { sets: 4, reps: 15, weight: 40 },
  Glutes: { sets: 3, reps: 12, weight: 30 },
  Quadriceps: { sets: 3, reps: 10, weight: 40 },
  Cardio: { sets: 1, reps: 0, weight: 0, duration: 30 },
  "Full Body": { sets: 3, reps: 10, weight: 20 },
};

export interface LocalExercise extends ExerciseEntry {
  sets: number;
  reps: number;
  weight: number;
  duration: number;
}

export function getLocalExercises(): LocalExercise[] {
  return DB.map((e) => {
    const d = CATEGORY_DEFAULTS[e.category] ?? {};
    return {
      ...e,
      sets: d.sets ?? 3,
      reps: d.reps ?? 10,
      weight: d.weight ?? 0,
      duration: e.duration ?? d.duration ?? 0,
    };
  });
}

export function findExercise(name: string): LocalExercise | undefined {
  return getLocalExercises().find((e) => e.name === name);
}

export function searchExercises(query: string): LocalExercise[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return getLocalExercises().filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.muscles.some((m) => m.toLowerCase().includes(q)),
  );
}

export function getExerciseCategories(): WorkoutCategory[] {
  return [...new Set(DB.map((e) => e.category))];
}
