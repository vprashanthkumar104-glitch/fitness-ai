import React, { useState } from 'react';
import { Page, ScheduledWorkout } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Flame,
  Trophy,
  Calendar,
  Clock,
  Dumbbell,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  Target,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Zap,
  BookmarkCheck,
  Trash2,
  Sliders,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface DashboardPageProps {
  setCurrentPage: (page: Page) => void;
}

const INITIAL_WORKOUT_SCHEDULE: ScheduledWorkout[] = [
  {
    id: 'wo-1',
    dayLabel: 'Today',
    dateStr: 'Scheduled for Today',
    title: 'Push Hypertrophy & Chest Architecture',
    focus: 'Pectorals, Anterior Deltoids, Triceps',
    durationMinutes: 55,
    targetRpe: 8.5,
    intensity: 'High',
    exercisesCount: 5,
    status: 'today',
    aiRoutinePreview: {
      warmup: '5 min Banded face pulls, rotator cuff internal/external rotations & light push-ups',
      primaryLifts: [
        'Incline Barbell Bench Press (4 sets x 8-10 reps @ RPE 8)',
        'Flat Dumbbell Neutral Press (3 sets x 10-12 reps)',
        'Low-to-High Cable Chest Flyes (3 sets x 12-15 reps, peak squeeze)',
        'Overhead Cable Triceps Extensions (3 sets x 12 reps)'
      ],
      cooldown: 'Doorway pectoral mobility stretch & static triceps release'
    }
  },
  {
    id: 'wo-2',
    dayLabel: 'Tomorrow',
    dateStr: 'Day 2',
    title: 'Posterior Chain & Back Thickness',
    focus: 'Latissimus Dorsi, Rhomboids, Biceps, Core',
    durationMinutes: 60,
    targetRpe: 8.0,
    intensity: 'High',
    exercisesCount: 6,
    status: 'upcoming',
    aiRoutinePreview: {
      warmup: 'Cat-Cow mobility, bird-dogs & scapular pull-ups',
      primaryLifts: [
        'Barbell Bent-Over Row (4 sets x 8 reps)',
        'Neutral-Grip Lat Pulldown (3 sets x 10-12 reps)',
        'Chest-Supported T-Bar Row (3 sets x 12 reps)',
        'Incline Dumbbell Bicep Curls (3 sets x 12 reps)'
      ],
      cooldown: 'Foam rolling thoracic spine & latissimus dorsi passive hang'
    }
  },
  {
    id: 'wo-3',
    dayLabel: 'Wednesday',
    dateStr: 'Day 3',
    title: 'Active Recovery & Joint Mobility Flow',
    focus: 'Hip Openers, Thoracic Rotation, Diaphragmatic Breath',
    durationMinutes: 35,
    targetRpe: 4.0,
    intensity: 'Low',
    exercisesCount: 4,
    status: 'rest',
    aiRoutinePreview: {
      warmup: 'Low-intensity stationary bike cadence for 5 minutes',
      primaryLifts: [
        'World\'s Greatest Stretch (3 sets x 5 reps per side)',
        '90/90 Hip Transition Drill (3 sets x 8 reps)',
        'Couch Stretch for hip flexor lengthening (2 min hold)',
        'Box breathing protocol (4-4-4-4 cadence for 10 minutes)'
      ],
      cooldown: 'Full body progressive muscle relaxation'
    }
  },
  {
    id: 'wo-4',
    dayLabel: 'Thursday',
    dateStr: 'Day 4',
    title: 'Lower Body Quad & Posterior Power',
    focus: 'Quadriceps, Gluteus Maximus, Calves',
    durationMinutes: 60,
    targetRpe: 9.0,
    intensity: 'Peak',
    exercisesCount: 5,
    status: 'upcoming',
    aiRoutinePreview: {
      warmup: 'Leg swings, bodyweight air squats & band monster walks',
      primaryLifts: [
        'Barbell Back Squats (4 sets x 6-8 reps)',
        'Bulgarian Split Squats (3 sets x 10 reps each leg)',
        'Leg Press with 3-second eccentric (3 sets x 12 reps)',
        'Standing Calf Raises (4 sets x 15 reps)'
      ],
      cooldown: 'Hamstring flossing & couch stretch'
    }
  },
  {
    id: 'wo-5',
    dayLabel: 'Friday',
    dateStr: 'Day 5',
    title: 'Upper Body Deltoid & Arm Hypertrophy',
    focus: 'Lateral Deltoids, Posterior Delts, Biceps & Triceps',
    durationMinutes: 50,
    targetRpe: 7.5,
    intensity: 'Moderate',
    exercisesCount: 5,
    status: 'upcoming',
    aiRoutinePreview: {
      warmup: 'Arm circles & banded rear delt flyes',
      primaryLifts: [
        'Dumbbell Lateral Raises (4 sets x 15 reps, drop set on final)',
        'Cable Face Pulls with rope (3 sets x 15 reps)',
        'Incline Skull Crushers (3 sets x 10 reps)',
        'Hammer Curls with Fat Gripz (3 sets x 12 reps)'
      ],
      cooldown: 'Wrist extensor and shoulder capsule stretch'
    }
  },
  {
    id: 'wo-6',
    dayLabel: 'Saturday',
    dateStr: 'Day 6',
    title: 'Posterior Leg Strength & Conditioning',
    focus: 'Hamstrings, Glutes, Lumbar & Core',
    durationMinutes: 50,
    targetRpe: 8.0,
    intensity: 'High',
    exercisesCount: 5,
    status: 'upcoming',
    aiRoutinePreview: {
      warmup: 'Glute bridges & single-leg Romanian deadlift drills',
      primaryLifts: [
        'Romanian Deadlifts (4 sets x 8-10 reps)',
        'Lying Leg Curls (3 sets x 12 reps with 2-sec contraction)',
        'Kettlebell Swings (4 sets x 20 reps)',
        'Hanging Knee Raises (3 sets x 15 reps)'
      ],
      cooldown: 'Pigeon pose & seated forward fold'
    }
  },
  {
    id: 'wo-7',
    dayLabel: 'Sunday',
    dateStr: 'Day 7',
    title: 'CNS Recovery & Nutritional Prep',
    focus: 'Central Nervous System & Recovery',
    durationMinutes: 0,
    targetRpe: 1.0,
    intensity: 'Low',
    exercisesCount: 0,
    status: 'rest',
    aiRoutinePreview: {
      warmup: 'Gentle walk outdoors (30 minutes)',
      primaryLifts: [
        'Hydration tracking: 3-4 liters with electrolytes',
        'High protein meal preparation for upcoming training block',
        'Sleep optimization: aim for 8.5 hours dark room rest'
      ],
      cooldown: 'Meditation and sleep hygiene ritual'
    }
  }
];

export const DashboardPage: React.FC<DashboardPageProps> = ({ setCurrentPage }) => {
  const { user, userProfile, loading, savedPlans, deletePlan, updateUserProfile, signInWithGoogle } = useAuth();
  const [schedule, setSchedule] = useState<ScheduledWorkout[]>(INITIAL_WORKOUT_SCHEDULE);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>('wo-1');
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(userProfile?.fitnessGoal || 'Muscle Building & Hypertrophy');
  const [selectedLevel, setSelectedLevel] = useState(userProfile?.fitnessLevel || 'Intermediate');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle workout completion
  const handleToggleComplete = async (workoutId: string) => {
    const currentWo = schedule.find((w) => w.id === workoutId);
    if (!currentWo) return;

    const willBeComplete = currentWo.status !== 'completed';
    setSchedule((prev) =>
      prev.map((w) => {
        if (w.id === workoutId) {
          return {
            ...w,
            status: willBeComplete ? 'completed' : 'today'
          };
        }
        return w;
      })
    );

    if (willBeComplete && userProfile) {
      try {
        setIsUpdating(true);
        const newCount = (userProfile.completedWorkouts || 0) + 1;
        const newStreak = (userProfile.streakDays || 1) + 1;
        await updateUserProfile({
          completedWorkouts: newCount,
          streakDays: newStreak
        });
        showToast('Workout marked complete! +1 Session & Streak updated in Firestore.');
      } catch (err) {
        console.error(err);
      } finally {
        setIsUpdating(false);
      }
    } else {
      showToast('Workout status updated.');
    }
  };

  // Increment active streak manually
  const handleIncrementStreak = async () => {
    if (!userProfile) return;
    try {
      setIsUpdating(true);
      const newStreak = (userProfile.streakDays || 0) + 1;
      await updateUserProfile({ streakDays: newStreak });
      showToast(`Training streak increased to ${newStreak} days in Cloud!`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Save goal changes
  const handleSaveGoal = async () => {
    if (!userProfile) return;
    try {
      setIsUpdating(true);
      await updateUserProfile({
        fitnessGoal: selectedGoal,
        fitnessLevel: selectedLevel
      });
      setIsEditingGoal(false);
      showToast('Profile parameters updated in Firestore.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-300 space-y-4">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wide">Authenticating athlete credentials with Firebase...</p>
      </div>
    );
  }

  // 2. Unauthenticated Gate
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Private Athlete Dashboard
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Authentication Required
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              This dashboard is private and personalized to your athlete account. Sign in to view your upcoming training schedule, continuous streaks, and cloud-synced workout history.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              id="btn-private-signin-google"
              onClick={() => signInWithGoogle()}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              <span>Sign in with Google</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="btn-private-goto-auth"
              onClick={() => setCurrentPage('auth')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs transition-colors border border-slate-700 cursor-pointer"
            >
              Use Email &amp; Password
            </button>

            <button
              onClick={() => setCurrentPage('home')}
              className="block w-full text-xs text-slate-400 hover:text-slate-200 pt-2 transition-colors cursor-pointer"
            >
              ← Return to Home Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated Dashboard Content
  const completedCount = userProfile?.completedWorkouts || schedule.filter((w) => w.status === 'completed').length;
  const streakCount = userProfile?.streakDays || 1;
  const consistencyScore = Math.min(100, Math.round((completedCount / 5) * 100));

  const filteredSchedule = schedule.filter((w) => {
    if (filter === 'today') return w.status === 'today';
    if (filter === 'upcoming') return w.status === 'upcoming' || w.status === 'rest';
    if (filter === 'completed') return w.status === 'completed';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs sm:text-sm font-semibold shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Athlete Header & Profile Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Athlete Info */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Athlete'}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 flex items-center justify-center font-bold text-2xl font-display">
                    {(user.displayName || user.email || 'A').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900" title="Active Cloud Session" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
                    {userProfile?.displayName || user.displayName || 'Athlete Member'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    ACSM Certified AI v1
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 font-mono">
                  {user.email}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                  <span>Goal: <strong className="text-emerald-300 font-medium">{userProfile?.fitnessGoal || 'Hypertrophy'}</strong></span>
                  <span>•</span>
                  <span>Level: <strong className="text-emerald-300 font-medium">{userProfile?.fitnessLevel || 'Intermediate'}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Actions / Adjust Goal */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                id="btn-edit-athlete-goal"
                onClick={() => setIsEditingGoal(!isEditingGoal)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isEditingGoal ? 'Close Parameters' : 'Adjust Focus & Level'}</span>
              </button>

              <button
                onClick={() => setCurrentPage('features')}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Routine Generator</span>
              </button>
            </div>
          </div>

          {/* Inline Goal Editing Drawer */}
          {isEditingGoal && (
            <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Primary Fitness Target
                </label>
                <select
                  value={selectedGoal}
                  onChange={(e) => setSelectedGoal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Muscle Building & Hypertrophy">Muscle Building & Hypertrophy</option>
                  <option value="Fat Loss & Caloric Deficit">Fat Loss & Caloric Deficit</option>
                  <option value="Functional Strength & Power">Functional Strength & Power</option>
                  <option value="Cardiovascular Endurance">Cardiovascular Endurance</option>
                  <option value="Joint Mobility & Longevity">Joint Mobility & Longevity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Training Experience
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Beginner (< 1 yr)">Beginner (&lt; 1 yr)</option>
                  <option value="Intermediate (1-3 yrs)">Intermediate (1-3 yrs)</option>
                  <option value="Advanced (3+ yrs)">Advanced (3+ yrs)</option>
                  <option value="Elite / Competitive">Elite / Competitive</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  id="btn-save-athlete-goal"
                  onClick={handleSaveGoal}
                  disabled={isUpdating}
                  className="w-full py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUpdating ? 'Saving...' : 'Save to Cloud Profile'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4 Personalized Progress Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Metric 1: Streak */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Streak</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold font-display text-white">
                {streakCount} <span className="text-base font-normal text-amber-400">Days</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Consistency across consecutive training days</p>
            </div>
            <button
              onClick={handleIncrementStreak}
              disabled={isUpdating}
              className="w-full mt-2 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              + Log Active Day Today
            </button>
          </div>

          {/* Metric 2: Completed Workouts */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Sessions</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold font-display text-white">
                {completedCount} <span className="text-base font-normal text-emerald-400">Total</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Logged resistance &amp; conditioning workouts</p>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Firestore Synced Record
              </span>
            </div>
          </div>

          {/* Metric 3: Weekly Consistency */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Weekly Target</span>
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold font-display text-white">
                {consistencyScore}% <span className="text-xs font-normal text-teal-400">of Goal</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${consistencyScore}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">Targeting 5 structured sessions / week</p>
          </div>

          {/* Metric 4: Target Volume */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Volume Load</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold font-display text-white">
                16-18 <span className="text-xs font-normal text-indigo-400">Sets/Group</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Adaptive progressive overload baseline</p>
            </div>
            <div className="pt-2">
              <span className="text-[11px] text-indigo-300">Phase: Deload in 2 weeks</span>
            </div>
          </div>
        </div>

        {/* Upcoming Workout Schedule Placeholders Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold font-display text-white flex items-center gap-2.5">
                <Calendar className="w-6 h-6 text-emerald-400" />
                Upcoming Workout Schedule
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Your AI-periodized 7-day training block with progressive resistance schemes.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filter === 'all' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                All (7)
              </button>
              <button
                onClick={() => setFilter('today')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filter === 'today' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filter === 'upcoming' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filter === 'completed' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Workout Schedule Cards Grid */}
          <div className="space-y-4">
            {filteredSchedule.map((workout) => {
              const isExpanded = expandedWorkoutId === workout.id;
              const isCompleted = workout.status === 'completed';
              const isToday = workout.status === 'today';

              return (
                <div
                  key={workout.id}
                  id={`workout-card-${workout.id}`}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isToday
                      ? 'bg-slate-900/90 border-emerald-500/50 shadow-xl shadow-emerald-500/10'
                      : isCompleted
                      ? 'bg-slate-900/40 border-slate-800/80 opacity-80'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Main Card Summary Bar */}
                  <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    <div className="flex items-start gap-4">
                      {/* Day / Status Indicator */}
                      <div
                        className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 text-center ${
                          isToday
                            ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                            : isCompleted
                            ? 'bg-slate-800 text-emerald-400'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <>
                            <span className="text-[10px] uppercase font-bold tracking-wider leading-none">
                              {workout.dayLabel.slice(0, 3)}
                            </span>
                            <span className="text-xs font-bold leading-none mt-1">
                              {workout.status === 'rest' ? 'REST' : `${workout.durationMinutes}m`}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold text-white">
                            {workout.title}
                          </h3>
                          {isToday && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-500 text-slate-950">
                              Active Today
                            </span>
                          )}
                          {isCompleted && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Session Logged
                            </span>
                          )}
                          {workout.status === 'rest' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400">
                              Active Recovery
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          Focus: <span className="text-slate-300 font-medium">{workout.focus}</span>
                        </p>
                      </div>
                    </div>

                    {/* Metadata & Controls */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0">
                      <div className="flex items-center gap-3 text-xs text-slate-400 pr-2 border-r border-slate-800">
                        {workout.durationMinutes > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {workout.durationMinutes} min
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          RPE {workout.targetRpe} ({workout.intensity})
                        </span>
                      </div>

                      {/* Action: Toggle Complete */}
                      {workout.status !== 'rest' && (
                        <button
                          id={`btn-complete-${workout.id}`}
                          onClick={() => handleToggleComplete(workout.id)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                            isCompleted
                              ? 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isCompleted ? 'Mark Incomplete' : 'Mark as Done'}</span>
                        </button>
                      )}

                      {/* Action: Expand Details */}
                      <button
                        onClick={() => setExpandedWorkoutId(isExpanded ? null : workout.id)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                        aria-label="Toggle Details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Exercise Blueprint Drawer */}
                  {isExpanded && (
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-slate-800/80 bg-slate-950/40 space-y-4 animate-in fade-in duration-150">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        
                        {/* Warmup */}
                        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                          <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                            Phase 1: Dynamic Primer &amp; Warmup
                          </span>
                          <p className="text-slate-300 leading-relaxed">
                            {workout.aiRoutinePreview.warmup}
                          </p>
                        </div>

                        {/* Primary Working Sets */}
                        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 md:col-span-2">
                          <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
                            Phase 2: Target Hypertrophy Sets
                          </span>
                          <ul className="space-y-1 text-slate-300">
                            {workout.aiRoutinePreview.primaryLifts.map((lift, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-emerald-400 font-bold">•</span>
                                <span>{lift}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Cooldown */}
                      <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 text-xs text-slate-400 flex items-center justify-between">
                        <span><strong>Cool-down / Mobility:</strong> {workout.aiRoutinePreview.cooldown}</span>
                        <button
                          onClick={() => setCurrentPage('features')}
                          className="text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold hover:underline shrink-0 ml-4 cursor-pointer"
                        >
                          Modify in AI Studio →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Saved AI Plans Section (from Firestore subcollection) */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-emerald-400" />
                Cloud-Synced AI Routines ({savedPlans.length})
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Routines and nutritional splits saved directly to your private Firestore database.
              </p>
            </div>

            <button
              onClick={() => setCurrentPage('features')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Generate New AI Plan</span>
            </button>
          </div>

          {savedPlans.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800/80 text-center space-y-3">
              <p className="text-sm text-slate-400">
                You haven&apos;t saved any custom AI plans yet.
              </p>
              <button
                onClick={() => setCurrentPage('features')}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all cursor-pointer"
              >
                Explore AI Workout Generators
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {plan.category || 'AI Routine'}
                      </span>
                      <button
                        onClick={() => {
                          deletePlan(plan.id);
                          showToast('Plan deleted from Firestore.');
                        }}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{plan.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed whitespace-pre-line">
                      {plan.content}
                    </p>
                  </div>

                  <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/80 flex justify-between">
                    <span>Saved: {new Date(plan.createdAt).toLocaleDateString()}</span>
                    <span className="text-emerald-400 font-semibold">Ready to Train</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
