import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  getAuth,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  onSnapshot, 
  deleteDoc 
} from 'firebase/firestore';
import { auth, db, cleanForFirestore } from './firebaseDb';
import { UserProfile, UserRole } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

const USERS_COLLECTION = 'users';

// Secondary app instance to allow admins to create new users without overriding their own session
function getSecondaryAuth() {
  const secondaryAppName = 'QuickSurfacesAdminCreationApp';
  const existingApp = getApps().find(a => a.name === secondaryAppName);
  const secondaryApp = existingApp || initializeApp(firebaseConfig, secondaryAppName);
  return getAuth(secondaryApp);
}

/**
 * Determine default role and display name for known team emails if not previously set in Firestore
 */
export function getDefaultTeamProfile(email: string, uid: string): UserProfile {
  const lower = email.toLowerCase().trim();
  
  if (lower.includes('januel') || lower.includes('esteban') || lower.includes('admin') || lower === 'janueldesign@gmail.com') {
    return {
      uid,
      email,
      displayName: lower.includes('januel') ? 'Januel / Esteban' : 'Esteban Gavotti',
      role: 'admin',
      canManageCatalog: true,
      canManageUsers: true,
      phone: '(305) 555-0199',
      createdAt: new Date().toISOString()
    };
  }

  if (lower.includes('ruben') || lower.includes('valverde')) {
    return {
      uid,
      email,
      displayName: 'Ruben Valverde',
      role: 'vendedor',
      canManageCatalog: true,
      canManageUsers: false,
      phone: '(305) 555-0188',
      createdAt: new Date().toISOString()
    };
  }

  // Generic salesperson default
  const localPart = email.split('@')[0];
  const formattedName = localPart
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    uid,
    email,
    displayName: formattedName || 'Vendedor',
    role: 'vendedor',
    canManageCatalog: true,
    canManageUsers: false,
    phone: '(305) 555-0100',
    createdAt: new Date().toISOString()
  };
}

/**
 * Fetch or bootstrap user profile from Firestore
 */
export async function getOrCreateUserProfile(user: FirebaseUser): Promise<UserProfile> {
  const userDocRef = doc(db, USERS_COLLECTION, user.uid);
  const snap = await getDoc(userDocRef);

  if (snap.exists()) {
    const data = snap.data() as UserProfile;
    const role: UserRole = data.role === 'admin' ? 'admin' : 'vendedor';
    return {
      ...data,
      uid: user.uid,
      email: user.email || data.email,
      role,
      canManageCatalog: data.canManageCatalog !== undefined ? data.canManageCatalog : true,
      canManageUsers: data.canManageUsers !== undefined ? data.canManageUsers : (role === 'admin')
    };
  }

  // Create initial profile in Firestore
  const defaultProfile = getDefaultTeamProfile(user.email || '', user.uid);
  try {
    await setDoc(userDocRef, cleanForFirestore(defaultProfile));
  } catch (err) {
    console.warn('Could not write user profile to Firestore (using in-memory):', err);
  }

  return defaultProfile;
}

/**
 * Sign in using Firebase Authentication (Email and Password)
 */
export async function loginWithEmailAndPassword(email: string, password: string): Promise<UserProfile> {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return await getOrCreateUserProfile(userCredential.user);
}

/**
 * Sign out the current user session
 */
export async function logout(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Listen to auth state changes and fetch profile
 */
export function subscribeToAuth(
  onUserChanged: (user: FirebaseUser | null, profile: UserProfile | null) => void,
  onError?: (err: Error) => void
): () => void {
  return onAuthStateChanged(
    auth,
    async (user) => {
      if (user) {
        try {
          const profile = await getOrCreateUserProfile(user);
          onUserChanged(user, profile);
        } catch (err: any) {
          console.error('Error fetching user profile:', err);
          const fallback = getDefaultTeamProfile(user.email || '', user.uid);
          onUserChanged(user, fallback);
        }
      } else {
        onUserChanged(null, null);
      }
    },
    (error) => {
      console.error('Auth state listener error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Real-time listener for current user's profile document changes in Firestore
 */
export function subscribeToUserProfile(
  uid: string,
  onProfile: (profile: UserProfile) => void
): () => void {
  const docRef = doc(db, USERS_COLLECTION, uid);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onProfile(docSnap.data() as UserProfile);
    }
  });
}

/**
 * Update an existing user's profile in Firestore (Admin or Owner)
 */
export async function updateUserProfile(profile: Partial<UserProfile> & { uid: string }): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, profile.uid);
  await updateDoc(docRef, cleanForFirestore(profile));
}

/**
 * Subscribe to all users in Firestore (for Admin User Management)
 */
export function subscribeToAllUsers(
  onSuccess: (users: UserProfile[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, USERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as UserProfile);
      });
      list.sort((a, b) => a.displayName.localeCompare(b.displayName));
      onSuccess(list);
    },
    (error) => {
      console.error('Error listing team users:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Admin action: create a new user account with Email/Password and register role in Firestore
 */
export async function createTeamUserAccount(
  email: string,
  pass: string,
  displayName: string,
  role: UserRole,
  phone?: string,
  canManageCatalog?: boolean,
  canManageUsers?: boolean
): Promise<UserProfile> {
  const secAuth = getSecondaryAuth();
  const cred = await createUserWithEmailAndPassword(secAuth, email.trim(), pass);
  const newUid = cred.user.uid;

  const newProfile: UserProfile = {
    uid: newUid,
    email: email.trim(),
    displayName: displayName.trim(),
    role,
    canManageCatalog: canManageCatalog !== undefined ? canManageCatalog : true,
    canManageUsers: canManageUsers !== undefined ? canManageUsers : (role === 'admin'),
    phone: phone?.trim() || '',
    createdAt: new Date().toISOString()
  };

  // Save to Firestore
  const userDocRef = doc(db, USERS_COLLECTION, newUid);
  await setDoc(userDocRef, cleanForFirestore(newProfile));

  // Sign out the secondary app session immediately so it doesn't linger
  await firebaseSignOut(secAuth);

  return newProfile;
}

/**
 * Delete a user profile from Firestore
 */
export async function deleteUserDoc(uid: string): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, uid);
  await deleteDoc(docRef);
}

/**
 * Translate Firebase Auth errors to clear, friendly Spanish messages
 */
export function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Correo electrónico o contraseña incorrectos.';
    case 'auth/invalid-email':
      return 'El formato del correo electrónico no es válido.';
    case 'auth/user-disabled':
      return 'Esta cuenta ha sido inhabilitada por el administrador.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Por seguridad, espera unos minutos antes de intentar de nuevo.';
    case 'auth/network-request-failed':
      return 'Error de conexión. Revisa tu acceso a internet.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta registrada con este correo.';
    default:
      return 'No fue posible iniciar sesión. Verifica tus datos e intenta nuevamente.';
  }
}
