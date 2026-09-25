import { FocusArea, AIFeature, FAQItem } from '../types';

export const FOCUS_AREAS: FocusArea[] = [
  {
    id: 'workouts',
    title: 'Workout Routines & Tips',
    category: 'Training',
    tagline: 'Hyper-personalized splits designed for hypertrophy, strength, and endurance.',
    description: 'Dynamic routines adapting to your recovery, equipment availability, and weekly schedule with progressive overload cues.',
    iconName: 'Dumbbell',
    badge: 'Popular',
    highlights: ['Adaptive 3-6 day training splits', 'Form check cue cards & tempo pacing', 'Warm-up & cooldown mobility protocols']
  },
  {
    id: 'nutrition',
    title: 'Nutrition & Diet',
    category: 'Nutrition',
    tagline: 'Data-driven caloric and macronutrient balancing tailored to metabolic goals.',
    description: 'Smart meal suggestions, macro calculations, and nutrient timing to fuel workouts and accelerate lean tissue recovery.',
    iconName: 'Utensils',
    badge: 'Essential',
    highlights: ['Dynamic macro calculation engine', 'Whole-food substitutions & grocery lists', 'Pre/post workout fueling guides']
  },
  {
    id: 'challenges',
    title: 'Fitness Challenges & Journeys',
    category: 'Motivation',
    tagline: 'Milestone-based 30-day and 90-day transformations with accountability.',
    description: 'Curated fitness quests that gamify consistency, track streaks, and build habits that outlast temporary motivation.',
    iconName: 'Trophy',
    badge: 'Community',
    highlights: ['30-day functional core challenge', 'Zero-to-5K progressive endurance quest', 'Streak tracker & milestone badges']
  },
  {
    id: 'equipment',
    title: 'Fitness Equipment Reviews',
    category: 'Gear & Tech',
    tagline: 'Objective, biomechanic-backed breakdowns of home gym & commercial gear.',
    description: 'Honest evaluations of adjustable dumbbells, power racks, recovery tools, and wear-and-tear longevity tests.',
    iconName: 'Sliders',
    badge: 'Tested',
    highlights: ['Home gym space vs budget audits', 'Smart barbell and cable comparisons', 'Longevity and durability stress ratings']
  },
  {
    id: 'wellness',
    title: 'Health & Wellness',
    category: 'Recovery',
    tagline: 'Holistic sleep, HRV monitoring, and stress regulation for longevity.',
    description: 'Because gains happen during recovery. Science-backed protocols for restorative sleep, nervous system regulation, and hydration.',
    iconName: 'HeartPulse',
    badge: 'Longevity',
    highlights: ['HRV-based recovery readiness score', 'Circadian rhythm and sleep architecture', 'Active recovery & foam rolling routines']
  },
  {
    id: 'technology',
    title: 'Fitness & Technology',
    category: 'Innovation',
    tagline: 'Next-gen computer vision, wearable syncing, and algorithmic periodization.',
    description: 'Integrating Apple Health, Garmin, and Whoop biometric data to calibrate your exercise intensity automatically.',
    iconName: 'Cpu',
    badge: 'Next-Gen',
    highlights: ['Wearable biometrics integration', 'Velocity-based training calculations', 'Smart reps and fatigue auto-adjust']
  },
  {
    id: 'techniques',
    title: 'Specific Training Techniques',
    category: 'Mechanics',
    tagline: 'Master mechanical tension, drop sets, RPE scaling, and mind-muscle cues.',
    description: 'Deep dives into biomechanics, joint angles, rest-pause sets, and eccentric tempo to break plateaus safely.',
    iconName: 'Activity',
    badge: 'Mastery',
    highlights: ['RPE & RIR auto-calibration', 'Eccentric overload & isometrics', 'Joint-friendly injury prevention variations']
  }
];

export const AI_FEATURES: AIFeature[] = [
  {
    id: 'ai-workout-planner',
    title: 'AI Workout Planner',
    tag: 'Periodization',
    badgeText: 'Core Engine',
    description: 'Generates custom multi-week periodization plans based on your target muscle groups, current fitness level, and available equipment.',
    iconName: 'Sparkles',
    capabilities: [
      'Volume & intensity load autoregulation',
      'Swap exercises instantly based on equipment access',
      'Generates warmups, working sets, and cooldowns'
    ],
    samplePrompt: 'Plan a 4-day upper/lower hypertrophy split for an intermediate lifter with dumbbells and a pullup bar.',
    sampleOutput: {
      headline: '4-Day Hypertrophy Split (Upper/Lower Bias)',
      details: [
        'Day 1: Upper Power (DB Incline Press, Weighted Chins, Lateral Raises - 16 sets)',
        'Day 2: Lower Quad Focus (Goblet Squats, Bulgarian Split Squats, Calf Raises)',
        'Day 3: Active Recovery & Mobility Routine (25 mins)',
        'Day 4: Upper Hypertrophy (DB Overhead Press, Chest-Supported Row, Arms Superset)',
        'Day 5: Lower Posterior Chain (DB Romanian Deadlifts, Single-Leg Hip Thrusts)'
      ]
    }
  },
  {
    id: 'ai-nutrition-assistant',
    title: 'AI Nutrition Assistant',
    tag: 'Metabolism',
    badgeText: 'Smart Diet',
    description: 'Calculates exact macro splits and curates whole-food recipes designed for your specific body composition and caloric deficit or surplus.',
    iconName: 'Salad',
    capabilities: [
      'Precision macro calculation (Protein/Carb/Fat)',
      'Allergy and dietary preference filtering (Vegan, Keto, High-Protein)',
      'Pre and post-workout nutritional timing recommendations'
    ],
    samplePrompt: 'Calculate daily macros for a 175lb individual in a 400 kcal deficit aiming to preserve muscle mass.',
    sampleOutput: {
      headline: 'Target: 2,150 kcal / day (400 kcal deficit)',
      details: [
        'Protein: 180g (720 kcal) — 33% total calories for lean tissue retention',
        'Carbohydrates: 200g (800 kcal) — 37% total calories centered around workout windows',
        'Fats: 70g (630 kcal) — 30% total calories for optimal endocrine health',
        'Hydration Goal: 3.5 Liters water with 500mg sodium pre-workout'
      ]
    }
  },
  {
    id: 'fitness-goal-planner',
    title: 'Fitness Goal Planner',
    tag: 'Roadmap',
    badgeText: 'Milestones',
    description: 'Breaks down ambitious physical milestones into measurable weekly sprint checkpoints with progression predictive modeling.',
    iconName: 'Target',
    capabilities: [
      'Realistic timeline estimation based on baseline metrics',
      'Weekly check-in benchmarks and target adjustment',
      'Plateau alert system when progression slows'
    ],
    samplePrompt: 'Map out a realistic timeline to progress from 2 push-ups to 25 consecutive strict push-ups.',
    sampleOutput: {
      headline: '8-Week Push-Up Mastery Pathway',
      details: [
        'Weeks 1-2: Incline Bench Push-ups (3x10) + Negative Eccentrics (3x5)',
        'Weeks 3-4: Knee-to-Floor Transition + Hollow Body Holds (4x30s)',
        'Weeks 5-6: Strict Push-up Cluster Sets (5 sets of 4 reps, 45s rest)',
        'Weeks 7-8: Pyramids & AMRAP tests leading to target 25 reps test'
      ]
    }
  },
  {
    id: 'challenge-journey-assistant',
    title: 'Challenge & Journey Assistant',
    tag: 'Habit Engine',
    badgeText: 'Gamified',
    description: 'Designs dynamic 30-day interactive quests that evolve as you log consistency, keeping your dopamine high and excuses low.',
    iconName: 'Flame',
    capabilities: [
      'Daily micro-challenges that adapt to your schedule',
      'Streak mechanics with guilt-free rest day recovery tokens',
      'Visual journey progress graph and badges'
    ],
    samplePrompt: 'Start the "30-Day Functional Core & Mobility" challenge.',
    sampleOutput: {
      headline: 'Day 1 of 30: Foundation & Hip Hinge',
      details: [
        'Quest 1: 3-Minute Deadbug & Bird-Dog core circuit',
        'Quest 2: 90/90 Hip Mobility flow (2 minutes per side)',
        'Streak: 1 Day active | 1 Rest Day Shield available',
        'Community: 4,120 athletes currently completing this daily quest'
      ]
    }
  },
  {
    id: 'equipment-recommendation-assistant',
    title: 'Equipment Recommendation Assistant',
    tag: 'Gear AI',
    badgeText: 'Buyer Guide',
    description: 'Analyzes your budget, floor dimensions, training discipline, and ceiling height to suggest the most cost-effective home gym setup.',
    iconName: 'ShoppingBag',
    capabilities: [
      'Square-footage optimization for compact apartments',
      'Cost-per-use rating for dumbbells, bands, and rigs',
      'Durability and resale value assessment'
    ],
    samplePrompt: 'Recommend a starter home gym for an 8x10 ft spare bedroom with a $500 total budget.',
    sampleOutput: {
      headline: 'Optimized $480 Compact Home Gym Kit',
      details: [
        '1. Quick-Adjust Dumbbell Pair (5-52.5 lbs) — $260 (Takes < 3 sq ft)',
        '2. Multi-Angle Foldable Utility Bench — $130 (Stows under bed)',
        '3. Heavy-Duty Doorframe Pull-Up Bar + Suspension Straps — $55',
        '4. High-Density Interlocking Rubber Mats (6-pack) — $35'
      ]
    }
  },
  {
    id: 'training-technique-guidance',
    title: 'Training Technique Guidance',
    tag: 'Biomechanics',
    badgeText: 'Form Precision',
    description: 'Provides granular anatomic cues, joint positioning adjustments, and bar-path corrections to optimize muscle recruitment and protect joints.',
    iconName: 'Compass',
    capabilities: [
      'Visual breakdown of setup, execution, and lockout phases',
      'Common mechanical breakdown flags (e.g. knee valgus, lumbar flexion)',
      'Joint-friendly alternative variations for existing injuries'
    ],
    samplePrompt: 'How do I stop feeling barbell squats in my lower back instead of my quads and glutes?',
    sampleOutput: {
      headline: 'Form Prescription: Barbell Back Squat',
      details: [
        'Adjustment 1: Elevate heels 0.5 inches on 5lb plates to improve dorsiflexion',
        'Adjustment 2: Switch from High-Bar to Low-Bar or use a Safety Squat Bar',
        'Adjustment 3: Initiate movement with knees breaking forward rather than hips hinging back first',
        'Drill: 2 sets of Goblet Squats with a 3-second pause at bottom before barbell sets'
      ]
    }
  },
  {
    id: 'fitness-qa-assistant',
    title: 'Fitness Q&A Assistant',
    tag: 'Evidence-Based',
    badgeText: '24/7 AI Coach',
    description: 'Instant answers to any exercise science, supplement safety, fasting protocol, or recovery methodology backed by sports medicine literature.',
    iconName: 'MessageSquareText',
    capabilities: [
      'Debunks viral fitness myths with peer-reviewed research',
      'Evidence-based supplement efficacy ratings (Creatine, Whey, Caffeine)',
      'Immediate adjustments for soreness and active recovery days'
    ],
    samplePrompt: 'Does eating carbohydrates after 8 PM actually cause fat gain if my total calories match?',
    sampleOutput: {
      headline: 'Evidence Verdict: Myth Debunked',
      details: [
        'Finding: Energy balance (calories in vs out) over 24-48 hour windows determines net fat balance.',
        'Metabolism doesn\'t shut down at night; your basal metabolic rate remains active.',
        'Nuance: Late-night snacking often leads to unintentional calorie surplus and disrupted REM sleep, which indirectly hinders recovery.',
        'Takeaway: Consume your carbs when it best fuels your training and aids sleep onset.'
      ]
    }
  }
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'general',
    question: 'What is Fitness AI and how does it work?',
    answer: 'Fitness AI is an intelligent fitness companion that synthesizes exercise science, metabolic principles, and your individual profile to generate personalized workout routines, nutrition plans, challenges, and training advice.'
  },
  {
    id: 'faq-2',
    category: 'general',
    question: 'Is Fitness AI suitable for complete beginners?',
    answer: 'Absolutely. Every plan, technique guide, and routine scales automatically to your experience level—whether you are performing your very first bodyweight squat or periodizing an advanced powerlifting program.'
  },
  {
    id: 'faq-3',
    category: 'ai',
    question: 'How accurate are the AI workout and nutrition recommendations?',
    answer: 'Our AI algorithms are grounded in established peer-reviewed biomechanics, the American College of Sports Medicine (ACSM) guidelines, and sports nutrition science to ensure safe and effective progression.'
  },
  {
    id: 'faq-4',
    category: 'ai',
    question: 'Can I customize plans if I have limited equipment or injuries?',
    answer: 'Yes! You can specify any equipment constraint (from bodyweight only to full commercial gym) as well as joint sensitivities (e.g. bad knees or shoulder impingement), and the AI will auto-substitute safe, effective alternatives.'
  },
  {
    id: 'faq-5',
    category: 'membership',
    question: 'Can I access Fitness AI on both desktop and mobile devices?',
    answer: 'Yes, Fitness AI is built as a fully responsive modern web application optimized for smartphones, tablets, and desktop workstations with fast loading speeds and touch-friendly controls.'
  },
  {
    id: 'faq-6',
    category: 'membership',
    question: 'What features are included in Version 1?',
    answer: 'Version 1 introduces our comprehensive fitness platform, including the core Home experience, the in-depth About mission, interactive AI feature previews, modern Google & Email authentication UI, and a dedicated contact support desk.'
  }
];

export const STATS = [
  { value: '150,000+', label: 'Workouts Generated' },
  { value: '98.4%', label: 'Form Accuracy Rating' },
  { value: '45+ Min', label: 'Saved Weekly on Planning' },
  { value: '4.9 / 5.0', label: 'User Satisfaction Score' }
];

export const TESTIMONIALS = [
  {
    name: 'Marcus Vance',
    role: 'Competitive CrossFit & Hybrid Athlete',
    quote: 'Fitness AI took the guesswork out of my periodization. My deadlift PR jumped 35 lbs while keeping my joints completely pain-free.',
    badge: 'Strength & Conditioning'
  },
  {
    name: 'Dr. Elena Rossi',
    role: 'Sports Nutritionist & Marathoner',
    quote: 'The nutrition assistant does not push fad diets. It focuses on sustainable macronutrient distribution and metabolic recovery.',
    badge: 'Endurance & Nutrition'
  },
  {
    name: 'Sarah Jenkins',
    role: 'Busy Tech Executive & Mother',
    quote: 'As someone with only 40 minutes a day, the AI Workout Planner built me a dumbbell routine that actually delivered visible results in 6 weeks.',
    badge: 'Home Workouts'
  }
];
