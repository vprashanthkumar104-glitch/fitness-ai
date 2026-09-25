import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';

export interface UserProfileData {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  fitnessGoal?: string;
  fitnessLevel?: string;
  equipment?: string;
  daysPerWeek?: string | number;
  startDate?: string;
  streakDays: number;
  completedWorkouts: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavedPlanItem {
  id: string;
  userId: string;
  featureId?: string;
  title: string;
  category?: string;
  content: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfileData | null;
  loading: boolean;
  savedPlans: SavedPlanItem[];
  signInWithGoogle: () => Promise<User | null>;
  signOutUser: () => Promise<void>;
  savePlan: (plan: Omit<SavedPlanItem, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfileData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [savedPlans, setSavedPlans] = useState<SavedPlanItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create user profile
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfileData);
          } else {
            const newProfile: UserProfileData = {
              userId: currentUser.uid,
              displayName: currentUser.displayName || 'Athlete',
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || '',
              fitnessGoal: 'Muscle Building & Hypertrophy',
              fitnessLevel: 'Intermediate',
              streakDays: 1,
              completedWorkouts: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        }

        // Listen to saved plans subcollection
        const plansRef = collection(db, 'users', currentUser.uid, 'saved_plans');
        const unsubPlans = onSnapshot(
          plansRef,
          (snapshot) => {
            const plans = snapshot.docs.map((d) => d.data() as SavedPlanItem);
            setSavedPlans(plans);
          },
          (error) => {
            handleFirestoreError(error, OperationType.LIST, `users/${currentUser.uid}/saved_plans`);
          }
        );

        setLoading(false);
        return () => unsubPlans();
      } else {
        setUserProfile(null);
        setSavedPlans([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Google Sign In Error:', error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setSavedPlans([]);
    } catch (error) {
      console.error('Sign Out Error:', error);
      throw error;
    }
  };

  const savePlan = async (planData: Omit<SavedPlanItem, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) throw new Error('Must be signed in to save a plan');
    const planId = 'plan_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const planDoc: SavedPlanItem = {
      id: planId,
      userId: user.uid,
      title: planData.title,
      content: planData.content,
      featureId: planData.featureId || 'custom',
      category: planData.category || 'Training',
      createdAt: new Date().toISOString(),
    };

    const path = `users/${user.uid}/saved_plans/${planId}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'saved_plans', planId), planDoc);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const deletePlan = async (planId: string) => {
    if (!user) throw new Error('Must be signed in to delete a plan');
    const path = `users/${user.uid}/saved_plans/${planId}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'saved_plans', planId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfileData>) => {
    if (!user || !userProfile) throw new Error('Must be signed in to update profile');
    const path = `users/${user.uid}`;
    const updatedData: UserProfileData = {
      ...userProfile,
      ...updates,
      userId: user.uid,
      email: userProfile.email,
      createdAt: userProfile.createdAt,
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'users', user.uid), updatedData);
      setUserProfile(updatedData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        savedPlans,
        signInWithGoogle,
        signOutUser,
        savePlan,
        deletePlan,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
