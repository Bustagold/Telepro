import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testConnection } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<boolean>;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<boolean>;
  signOutUser: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  registerProfile: (handle: string, displayName: string, headline?: string) => Promise<void>;
  isHandleSetupNeeded: boolean;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isHandleSetupNeeded, setIsHandleSetupNeeded] = useState<boolean>(false);

  // Test connection on boot
  useEffect(() => {
    testConnection();
  }, []);

  const clearAuthError = () => setAuthError(null);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            setUserProfile(data);
            setIsHandleSetupNeeded(false);

            // Update presence to online
            try {
              await updateDoc(userRef, {
                onlineStatus: 'online',
                lastSeen: new Date().toISOString()
              });
            } catch {
              // Ignore presence update error if offline
            }
          } else {
            // New user without Firestore profile document
            const suggestedHandle = (firebaseUser.email?.split('@')[0] || 'user_' + firebaseUser.uid.slice(0, 5))
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, '_')
              .slice(0, 24);

            const initialProfile: UserProfile = {
              userId: firebaseUser.uid,
              handle: suggestedHandle,
              displayName: firebaseUser.displayName || 'Professional',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firebaseUser.displayName || 'Pro')}`,
              headline: 'Technology Professional & Network Member',
              bio: 'Connecting with innovators, engineers, and leaders on TelePro.',
              company: '',
              location: 'Global',
              skills: 'Engineering, Collaboration, Leadership',
              experience: '',
              education: '',
              onlineStatus: 'online',
              lastSeen: new Date().toISOString(),
              connectionsCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            // Save new user profile to Firestore
            await setDoc(userRef, initialProfile);
            setUserProfile(initialProfile);
            setIsHandleSetupNeeded(true);
          }
        } catch (error) {
          console.error('Error fetching/creating profile:', error);
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUserProfile(null);
        setIsHandleSetupNeeded(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real Google Sign In (Popup)
  const signInWithGoogle = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      const msg = error.code === 'auth/popup-closed-by-user'
        ? 'Sign-in popup was closed before completing.'
        : error.code === 'auth/popup-blocked'
        ? 'Browser popup was blocked. Please enable popups for this site or use email sign-in.'
        : error.message || 'Google sign in failed.';
      setAuthError(msg);
      return false;
    }
  };

  // Real Email & Password Sign In
  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      return true;
    } catch (error: any) {
      console.error('Email sign-in error:', error);
      const msg = error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential'
        ? 'Invalid email or password. Please verify your credentials or create an account.'
        : error.message || 'Failed to sign in.';
      setAuthError(msg);
      return false;
    }
  };

  // Real Email & Password Sign Up
  const signUpWithEmail = async (email: string, pass: string, name: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (res.user && name.trim()) {
        await updateProfile(res.user, { displayName: name.trim() });
      }
      return true;
    } catch (error: any) {
      console.error('Email sign-up error:', error);
      const msg = error.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists. Please sign in instead.'
        : error.code === 'auth/weak-password'
        ? 'Password must be at least 6 characters.'
        : error.message || 'Failed to create account.';
      setAuthError(msg);
      return false;
    }
  };

  const signOutUser = async () => {
    if (currentUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          onlineStatus: 'offline',
          lastSeen: new Date().toISOString()
        });
      } catch {
        // Ignore if error during sign out
      }
    }
    await signOut(auth);
    setUserProfile(null);
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!currentUser || !userProfile) return;
    const userRef = doc(db, 'users', currentUser.uid);
    const updated = {
      ...userProfile,
      ...data,
      updatedAt: new Date().toISOString()
    };
    try {
      await updateDoc(userRef, updated);
      setUserProfile(updated);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  const registerProfile = async (handle: string, displayName: string, headline?: string) => {
    if (!currentUser) return;
    const cleanHandle = handle.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 32);
    const userRef = doc(db, 'users', currentUser.uid);
    const updated: UserProfile = {
      ...(userProfile || {
        userId: currentUser.uid,
        email: currentUser.email || '',
        createdAt: new Date().toISOString()
      }),
      userId: currentUser.uid,
      handle: cleanHandle,
      displayName: displayName.trim(),
      headline: headline?.trim() || 'Professional Network Member',
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(userRef, updated, { merge: true });
      setUserProfile(updated);
      setIsHandleSetupNeeded(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        authError,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOutUser,
        updateProfileData,
        registerProfile,
        isHandleSetupNeeded,
        clearAuthError
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
