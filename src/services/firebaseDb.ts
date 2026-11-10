import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  writeBatch,
  query,
  where
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, Client, Quotation, AppSettings } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CLIENTS, DEFAULT_SETTINGS } from '../data/initialProducts';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with ignoreUndefinedProperties to prevent unhandled undefined field rejections
function getInitializedDb() {
  try {
    return firebaseConfig.firestoreDatabaseId 
      ? initializeFirestore(app, { ignoreUndefinedProperties: true }, firebaseConfig.firestoreDatabaseId)
      : initializeFirestore(app, { ignoreUndefinedProperties: true });
  } catch (e) {
    return firebaseConfig.firestoreDatabaseId 
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
  }
}

export const db = getInitializedDb();

// Initialize Auth
export const auth = getAuth(app);

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

// Helper to sanitize objects for Firestore (removes undefined values that Firestore rejects)
export function cleanForFirestore<T>(data: T): any {
  if (data === null || data === undefined) return null;
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => (typeof item === 'object' && item !== null ? cleanForFirestore(item) : item));
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(data as Record<string, any>)) {
      if (val !== undefined) {
        cleaned[key] = typeof val === 'object' && val !== null ? cleanForFirestore(val) : val;
      }
    }
    return cleaned;
  }
  return data;
}

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
            batch.set(docRef, cleanForFirestore(prod));
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
        const data = d.data() as Product;
        products.push({
          ...data,
          id: data.id || d.id
        });
      });

      // Filter out any locally blacklisted deleted product IDs so they don't flicker back
      try {
        const deletedIdsStr = localStorage.getItem('qs_deleted_product_ids');
        const localDeletedIds: string[] = deletedIdsStr ? JSON.parse(deletedIdsStr) : [];
        if (localDeletedIds.length > 0) {
          const filtered = products.filter(p => !localDeletedIds.includes(p.id));
          onSuccess(filtered);
          return;
        }
      } catch (e) {
        console.warn('Error reading deleted products filter:', e);
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
  if (!product?.id) {
    product.id = `prod-${Date.now()}`;
  }

  // Remove from deleted blacklist if re-created or edited
  try {
    const deletedIdsStr = localStorage.getItem('qs_deleted_product_ids');
    if (deletedIdsStr) {
      const localDeletedIds: string[] = JSON.parse(deletedIdsStr);
      const filtered = localDeletedIds.filter(id => id !== product.id);
      localStorage.setItem('qs_deleted_product_ids', JSON.stringify(filtered));
    }
  } catch (e) {
    // Ignore localStorage parse errors
  }

  const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
  const cleaned = cleanForFirestore(product);
  await setDoc(docRef, cleaned, { merge: true });
}

export async function deleteProductFromDb(productId: string): Promise<void> {
  if (!productId) return;

  // 1. Immediately store in local blacklist so it never flickers back
  try {
    const deletedIdsStr = localStorage.getItem('qs_deleted_product_ids');
    const localDeletedIds: string[] = deletedIdsStr ? JSON.parse(deletedIdsStr) : [];
    if (!localDeletedIds.includes(productId)) {
      localDeletedIds.push(productId);
      localStorage.setItem('qs_deleted_product_ids', JSON.stringify(localDeletedIds));
    }
  } catch (e) {
    console.error('Error blacklisting deleted product ID:', e);
  }

  // 2. Delete document directly by ID
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Error deleting direct doc from Firestore:', e);
  }

  // 3. Delete any extra docs with matching 'id' field in Firestore
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), where('id', '==', productId));
    const snaps = await getDocs(q);
    if (!snaps.empty) {
      const batch = writeBatch(db);
      snaps.forEach(s => batch.delete(s.ref));
      await batch.commit();
    }
  } catch (e) {
    console.warn('Error checking extra doc matches for deletion:', e);
  }
}

export async function batchSaveProductsToDb(products: Product[]): Promise<void> {
  const batch = writeBatch(db);
  for (const prod of products) {
    if (!prod?.id) continue;
    const docRef = doc(db, PRODUCTS_COLLECTION, prod.id);
    batch.set(docRef, cleanForFirestore(prod), { merge: true });
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
  if (!client || !client.id) {
    throw new Error('No se puede guardar un cliente sin un ID válido');
  }
  const docRef = doc(db, CLIENTS_COLLECTION, client.id);
  const cleaned = cleanForFirestore(client);
  await setDoc(docRef, cleaned, { merge: true });
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
  if (!quote || !quote.id) {
    throw new Error('No se puede guardar una cotización sin un ID válido');
  }
  const docRef = doc(db, QUOTATIONS_COLLECTION, quote.id);
  const cleaned = cleanForFirestore(quote);
  await setDoc(docRef, cleaned, { merge: true });
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
      setDoc(docRef, cleanForFirestore(DEFAULT_SETTINGS)).catch(() => {});
      onSuccess(DEFAULT_SETTINGS);
    }
  });
}

export async function saveSettingsToDb(settings: AppSettings): Promise<void> {
  const docRef = doc(db, SETTINGS_COLLECTION, 'general');
  const cleaned = cleanForFirestore(settings);
  await setDoc(docRef, cleaned, { merge: true });
}
