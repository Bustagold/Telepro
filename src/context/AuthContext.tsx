import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testConnection } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsDemo: (demoHandle: string, name: string, title: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  registerProfile: (handle: string, displayName: string, headline?: string) => Promise<void>;
  isHandleSetupNeeded: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isHandleSetupNeeded, setIsHandleSetupNeeded] = useState<boolean>(false);

  // Test connection on boot
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserProfile(userSnap.data() as UserProfile);
            setIsHandleSetupNeeded(false);
          } else {
            // User signed in but has not completed Telegram @handle and profile setup
            setIsHandleSetupNeeded(true);
            // Default placeholder profile
            const suggestedHandle = (firebaseUser.email?.split('@')[0] || 'pro_user')
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, '_')
              .slice(0, 24);

            setUserProfile({
              userId: firebaseUser.uid,
              handle: suggestedHandle,
              displayName: firebaseUser.displayName || 'Professional',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firebaseUser.displayName || 'Pro')}`,
              headline: 'Technology Professional & Leader',
              bio: 'Passionate professional connecting with industry innovators.',
              company: '',
              location: 'Remote',
              skills: 'Communication, Leadership, Problem Solving',
              experience: 'Senior Professional with demonstrated track record.',
              education: 'Bachelor of Science'
            });
          }
        } catch (error) {
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

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      // If popup was closed or blocked by iframe, inform user
      alert('Sign-in popup notice: ' + (error.message || 'Please enable popups or try Demo Account below.'));
    }
  };

  // Demo sign-in for rapid testing and multi-device preview testing
  const signInAsDemo = async (demoHandle: string, name: string, title: string) => {
    // Generate deterministic demo profile for testing
    const demoId = 'demo_' + demoHandle;
    const demoProfile: UserProfile = {
      userId: demoId,
      handle: demoHandle,
      displayName: name,
      email: `${demoHandle}@telepro.network`,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${demoHandle}`,
      headline: title,
      company: 'Tech Corp & Ventures',
      location: 'San Francisco, CA',
      bio: `Professional profile for ${name}. Telegram ID: @${demoHandle}`,
      skills: 'Architecture, Cloud, TypeScript, Real-time Systems, Product Strategy',
      experience: `• Lead Specialist — Tech Corp (2022 - Present)\nLeading distributed team.\n• Senior Engineer — Enterprise Tech (2018 - 2022)`,
      education: 'B.S. in Computer Science',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store in state
    setUserProfile(demoProfile);
    setIsHandleSetupNeeded(false);

    // Save to Firestore if accessible
    try {
      await setDoc(doc(db, 'users', demoId), demoProfile);
    } catch {
      // Demo fallback in case unauthenticated firestore rule blocks
    }
  };

  const registerProfile = async (handle: string, displayName: string, headline?: string) => {
    if (!currentUser && !userProfile) return;
    const uid = currentUser?.uid || userProfile?.userId || 'guest_' + Date.now();
    const cleanHandle = handle.toLowerCase().replace(/[^a-z0-9_]/g, '');

    const newProfile: UserProfile = {
      userId: uid,
      handle: cleanHandle,
      displayName: displayName || 'Professional',
      email: currentUser?.email || `${cleanHandle}@telepro.network`,
      photoURL: currentUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
      headline: headline || 'Professional on TelePro',
      bio: userProfile?.bio || 'Building the future of professional communication.',
      company: userProfile?.company || '',
      location: userProfile?.location || 'Remote',
      skills: userProfile?.skills || 'Engineering, Collaboration',
      experience: userProfile?.experience || '',
      education: userProfile?.education || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (currentUser) {
        await setDoc(doc(db, 'users', uid), newProfile);
      }
      setUserProfile(newProfile);
      setIsHandleSetupNeeded(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!userProfile) return;
    const uid = userProfile.userId;
    const updated: UserProfile = {
      ...userProfile,
      ...data,
      updatedAt: new Date().toISOString()
    };

    try {
      if (currentUser) {
        await updateDoc(doc(db, 'users', uid), data);
      }
      setUserProfile(updated);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign-out error:', error);
      setUserProfile(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signInWithGoogle,
        signInAsDemo,
        signOutUser,
        updateProfileData,
        registerProfile,
        isHandleSetupNeeded
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
