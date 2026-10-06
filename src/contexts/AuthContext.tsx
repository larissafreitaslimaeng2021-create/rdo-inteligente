import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  signInWithPopup,
  GoogleAuthProvider,
  googleProvider,
  setCachedGoogleToken,
  getCachedGoogleToken,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User,
  OperationType,
  handleFirestoreError,
} from '../lib/firebase';
import type { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isEditor: boolean;
  isViewer: boolean;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, role?: UserRole) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  getGoogleDriveToken: () => Promise<string | null>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load or initialize user profile in Firestore
  const loadOrCreateProfile = async (firebaseUser: User): Promise<UserProfile> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setProfile(data);
        return data;
      } else {
        // Initial profile creation: all registered accounts start as Editor
        const initialRole: UserRole = 'Editor';

        const newProfile: Record<string, any> = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Engenheiro',
          role: initialRole,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (firebaseUser.photoURL) {
          newProfile.photoURL = firebaseUser.photoURL;
        }

        await setDoc(userDocRef, newProfile as UserProfile, { merge: true });
        setProfile(newProfile as UserProfile);
        return newProfile as UserProfile;
      }
    } catch (err) {
      console.warn('Could not read user profile, using fallback session profile:', err);
      const fallback: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Engenheiro',
        role: firebaseUser.email === 'larifreitaseng@gmail.com' ? 'Editor' : 'Editor',
      };
      setProfile(fallback);
      return fallback;
    }
  };

  useEffect(() => {
    // Safety fallback: ensure loading screen NEVER hangs permanently (max 2.5s)
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      clearTimeout(safetyTimer);
      setUser(currentUser);
      if (currentUser) {
        try {
          // Wrap in a 2s timeout so slow Firestore connection never blocks UI
          await Promise.race([
            loadOrCreateProfile(currentUser),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Profile timeout')), 2000)),
          ]);
        } catch (err) {
          console.warn('Profile load timeout or error, applying fallback session profile:', err);
          setProfile({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Engenheiro',
            role: 'Editor',
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await loadOrCreateProfile(cred.user);
    } catch (err: any) {
      // If user does not exist in Firebase Auth yet, automatically register them!
      if (
        err?.code === 'auth/user-not-found' ||
        err?.code === 'auth/invalid-credential' ||
        err?.message?.includes('user-not-found') ||
        err?.message?.includes('INVALID_LOGIN_CREDENTIALS')
      ) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
          await loadOrCreateProfile(cred.user);
          return;
        } catch (regErr: any) {
          if (regErr?.code === 'auth/email-already-in-use') {
            throw new Error('Senha incorreta para este e-mail. Caso tenha esquecido, clique em "Esqueci minha senha" ou entre com o Google.');
          }
          throw regErr;
        }
      }
      throw err;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, role: UserRole = 'Editor') => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }
    const userDocRef = doc(db, 'users', cred.user.uid);
    const newProfile: UserProfile = {
      uid: cred.user.uid,
      email: cred.user.email || email.trim(),
      displayName: name || email.split('@')[0],
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(userDocRef, newProfile);
      setProfile(newProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${cred.user.uid}`);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const googleCredential = GoogleAuthProvider.credentialFromResult(cred);
      if (googleCredential?.accessToken) {
        setCachedGoogleToken(googleCredential.accessToken);
      }
      await loadOrCreateProfile(cred.user);
    } catch (err: any) {
      if (err?.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        throw new Error(
          `O domínio "${domain}" ainda não está autorizado para login Google no Firebase Console. Para entrar agora, utilize seu e-mail e senha no formulário acima ou autorize o domínio "${domain}" nas configurações do Firebase Authentication.`
        );
      }
      if (err?.code === 'auth/popup-closed-by-user') {
        return;
      }
      throw err;
    }
  };

  const getGoogleDriveToken = async (): Promise<string | null> => {
    const cached = getCachedGoogleToken();
    if (cached) return cached;
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const googleCredential = GoogleAuthProvider.credentialFromResult(cred);
      if (googleCredential?.accessToken) {
        setCachedGoogleToken(googleCredential.accessToken);
        return googleCredential.accessToken;
      }
    } catch (err) {
      console.warn('Google Drive authorization required or popup closed:', err);
    }
    return null;
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (auth.currentUser) {
      await loadOrCreateProfile(auth.currentUser);
    }
  };

  const role: UserRole = profile?.role || 'Editor';
  const isEditor = role !== 'Visualizador';
  const isViewer = role === 'Visualizador';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isEditor,
        isViewer,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        getGoogleDriveToken,
        resetPassword,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
