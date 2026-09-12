import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, Client, Quotation, AppSettings } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CLIENTS, DEFAULT_SETTINGS } from '../data/initialProducts';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom Database ID if present
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Sign in anonymously in the background if not signed in to establish an authenticated session
signInAnonymously(auth).catch((err) => {
  console.warn('Anonymous auth note (fallback mode):', err.message);
});

// Test Connection per guidelines
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'status'));
    return true;
  } catch (error: any) {
    if (error?.message && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline mode.');
      return false;
    }
    // Any other response (like document not found) confirms connection to the server
    return true;
  }
}
testConnection();

// Collection References
const PRODUCTS_COLLECTION = 'products';
const CLIENTS_COLLECTION = 'clients';
const QUOTATIONS_COLLECTION = 'quotations';
const SETTINGS_COLLECTION = 'settings';

// ==========================================
// 1. PRODUCTS (Catálogo de Productos en la Nube)
// ==========================================

export function subscribeToProducts(
  onSuccess: (products: Product[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, PRODUCTS_COLLECTION);

  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        console.log('Firebase: Colección de productos vacía. Sembrando catálogo inicial...');
        // Seed initial catalog so products are immediately available in Firestore
        try {
          const batch = writeBatch(db);
          for (const prod of INITIAL_PRODUCTS) {
            const docRef = doc(db, PRODUCTS_COLLECTION, prod.id);
            batch.set(docRef, prod);
          }
          await batch.commit();
          onSuccess(INITIAL_PRODUCTS);
          return;
        } catch (e: any) {
          console.error('Error sembrando catálogo en Firestore:', e);
          onSuccess(INITIAL_PRODUCTS);
          return;
        }
      }

      const products: Product[] = [];
      snapshot.forEach((d) => {
        products.push(d.data() as Product);
      });

      // Check if Firestore catalog needs to be upgraded with the official PDF catalog variants
      const ultraPulse = products.find((p) => p.id === 'spc-10mm-ultrapulse');
      const needsOfficialUpgrade = !ultraPulse || !ultraPulse.colors?.some((c) => c.code === 'SI-20');
      if (needsOfficialUpgrade) {
        console.log('Actualizando catálogo de Firestore con variantes oficiales del PDF...');
        try {
          const batch = writeBatch(db);
          for (const prod of INITIAL_PRODUCTS) {
            const docRef = doc(db, PRODUCTS_COLLECTION, prod.id);
            batch.set(docRef, prod);
          }
          await batch.commit();
          // Re-save any custom products created by the user
          const customProds = products.filter((p) => p.isCustom);
          for (const cp of customProds) {
            await setDoc(doc(db, PRODUCTS_COLLECTION, cp.id), cp, { merge: true });
          }
          return;
        } catch (e) {
          console.warn('Could not auto-upgrade Firestore catalog:', e);
        }
      }

      onSuccess(products);
    },
    (error) => {
      console.error('Error escuchando productos en Firestore:', error);
      if (onError) onError(error);
    }
  );
}

export async function saveProductToDb(product: Product): Promise<void> {
  const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
  await setDoc(docRef, product, { merge: true });
}

export async function deleteProductFromDb(productId: string): Promise<void> {
  const docRef = doc(db, PRODUCTS_COLLECTION, productId);
  await deleteDoc(docRef);
}

export async function batchSaveProductsToDb(products: Product[]): Promise<void> {
  const batch = writeBatch(db);
  for (const prod of products) {
    const docRef = doc(db, PRODUCTS_COLLECTION, prod.id);
    batch.set(docRef, prod, { merge: true });
  }
  await batch.commit();
}

// ==========================================
// 2. CLIENTS (Directorio de Clientes en la Nube)
// ==========================================

export function subscribeToClients(
  onSuccess: (clients: Client[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, CLIENTS_COLLECTION);

  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        console.log('Firebase: Colección de clientes vacía. Sembrando clientes iniciales...');
        try {
          const batch = writeBatch(db);
          for (const client of INITIAL_CLIENTS) {
            const docRef = doc(db, CLIENTS_COLLECTION, client.id);
            batch.set(docRef, client);
          }
          await batch.commit();
          onSuccess(INITIAL_CLIENTS);
          return;
        } catch (e) {
          onSuccess(INITIAL_CLIENTS);
          return;
        }
      }

      const clients: Client[] = [];
      snapshot.forEach((d) => {
        clients.push(d.data() as Client);
      });

      // Sort newest first
      clients.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onSuccess(clients);
    },
    (error) => {
      console.error('Error escuchando clientes en Firestore:', error);
      if (onError) onError(error);
    }
  );
}

export async function saveClientToDb(client: Client): Promise<void> {
  const docRef = doc(db, CLIENTS_COLLECTION, client.id);
  await setDoc(docRef, client, { merge: true });
}

export async function deleteClientFromDb(clientId: string): Promise<void> {
  const docRef = doc(db, CLIENTS_COLLECTION, clientId);
  await deleteDoc(docRef);
}

// ==========================================
// 3. QUOTATIONS (Historial Centralizado de Cotizaciones)
// ==========================================

export function subscribeToQuotations(
  onSuccess: (quotes: Quotation[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, QUOTATIONS_COLLECTION);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const quotations: Quotation[] = [];
      snapshot.forEach((d) => {
        quotations.push(d.data() as Quotation);
      });

      // Sort newest first by creation or date
      quotations.sort((a, b) => (b.createdAt || b.date || '').localeCompare(a.createdAt || a.date || ''));
      onSuccess(quotations);
    },
    (error) => {
      console.error('Error escuchando cotizaciones en Firestore:', error);
      if (onError) onError(error);
    }
  );
}

export async function saveQuotationToDb(quote: Quotation): Promise<void> {
  const docRef = doc(db, QUOTATIONS_COLLECTION, quote.id);
  await setDoc(docRef, quote, { merge: true });
}

export async function deleteQuotationFromDb(quoteId: string): Promise<void> {
  const docRef = doc(db, QUOTATIONS_COLLECTION, quoteId);
  await deleteDoc(docRef);
}

// ==========================================
// 4. SETTINGS (Configuraciones de la Tienda)
// ==========================================

export function subscribeToSettings(
  onSuccess: (settings: AppSettings) => void
): () => void {
  const docRef = doc(db, SETTINGS_COLLECTION, 'general');

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onSuccess(docSnap.data() as AppSettings);
    } else {
      // Seed default settings
      setDoc(docRef, DEFAULT_SETTINGS).catch(() => {});
      onSuccess(DEFAULT_SETTINGS);
    }
  });
}

export async function saveSettingsToDb(settings: AppSettings): Promise<void> {
  const docRef = doc(db, SETTINGS_COLLECTION, 'general');
  await setDoc(docRef, settings, { merge: true });
}
