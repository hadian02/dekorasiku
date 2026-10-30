import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { OrderDetails, Product, Artisan, ArtisanProposal, ArtisanProposalChat } from '../types';
import {
  INITIAL_ORDERS,
  INITIAL_REGISTERED_ARTISANS,
  INITIAL_PROPOSALS,
  INITIAL_PROPOSAL_CHATS
} from '../data/initialData';
import { PRODUCTS } from '../data/products';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: The app will break without this line
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Validate connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

// --- Live Orders Real-Time Sync ---
export function subscribeLiveOrders(
  onUpdate: (orders: OrderDetails[]) => void
) {
  const ordersCol = collection(db, 'orders');

  return onSnapshot(
    ordersCol,
    async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial orders into Firestore so KK-1110 is persisted live
        for (const ord of INITIAL_ORDERS) {
          try {
            await setDoc(doc(db, 'orders', ord.orderId), ord);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `orders/${ord.orderId}`);
          }
        }
        return;
      }

      const liveList: OrderDetails[] = [];
      snapshot.forEach((d) => {
        liveList.push(d.data() as OrderDetails);
      });

      // Sort by newest first (descending)
      liveList.sort((a, b) => {
        const timeA = new Date(a.date).getTime() || 0;
        const timeB = new Date(b.date).getTime() || 0;
        return timeB - timeA;
      });

      onUpdate(liveList);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'orders');
    }
  );
}

export async function createLiveOrder(order: OrderDetails) {
  try {
    const docRef = doc(db, 'orders', order.orderId);
    await setDoc(docRef, {
      ...order,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `orders/${order.orderId}`);
    throw err;
  }
}

export async function updateLiveOrder(orderId: string, updates: Partial<OrderDetails>) {
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    throw err;
  }
}

// --- Live Products & Stock Real-Time Sync ---
export function subscribeLiveProducts(
  onUpdate: (products: Product[]) => void
) {
  const prodCol = collection(db, 'products');

  return onSnapshot(
    prodCol,
    async (snapshot) => {
      if (snapshot.empty) {
        // Seed default products into Firestore
        for (const p of PRODUCTS) {
          try {
            await setDoc(doc(db, 'products', p.id), p);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `products/${p.id}`);
          }
        }
        return;
      }

      const liveProducts: Product[] = [];
      snapshot.forEach((d) => {
        liveProducts.push(d.data() as Product);
      });

      // Split into custom published products and default catalog products
      const defaultProductIds = new Set(PRODUCTS.map((p) => p.id));
      const customProducts = liveProducts.filter((p) => !defaultProductIds.has(p.id));
      const standardProducts = liveProducts.filter((p) => defaultProductIds.has(p.id));

      // Newly published custom kriya appear at the very top (sorted newest first)
      customProducts.sort((a, b) => b.id.localeCompare(a.id));

      // Standard products follow the curated display order in PRODUCTS
      standardProducts.sort((a, b) => {
        const idxA = PRODUCTS.findIndex((p) => p.id === a.id);
        const idxB = PRODUCTS.findIndex((p) => p.id === b.id);
        return (idxA >= 0 ? idxA : 99) - (idxB >= 0 ? idxB : 99);
      });

      const fullCatalog = [...customProducts, ...standardProducts];
      onUpdate(fullCatalog);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'products');
    }
  );
}

export async function saveLiveProduct(product: Product) {
  try {
    const docRef = doc(db, 'products', product.id);
    await setDoc(docRef, product);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`);
    throw err;
  }
}

export async function deleteLiveProduct(productId: string) {
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
    throw err;
  }
}

export async function updateLiveProductStock(productId: string, newStock: number) {
  try {
    const docRef = doc(db, 'products', productId);
    await updateDoc(docRef, { stock: Math.max(0, newStock) });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `products/${productId}`);
    throw err;
  }
}

// --- Live Registered Artisans Real-Time Sync ---
export function subscribeLiveArtisans(
  onUpdate: (artisans: Artisan[]) => void
) {
  const artCol = collection(db, 'artisans');

  return onSnapshot(
    artCol,
    async (snapshot) => {
      if (snapshot.empty) {
        // Seed all 5 default registered artisans
        for (const a of INITIAL_REGISTERED_ARTISANS) {
          try {
            await setDoc(doc(db, 'artisans', a.id), a);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `artisans/${a.id}`);
          }
        }
        return;
      }

      const liveArtisans: Artisan[] = [];
      snapshot.forEach((d) => {
        liveArtisans.push(d.data() as Artisan);
      });

      liveArtisans.sort((a, b) => (a.seqNumber || 0) - (b.seqNumber || 0));
      onUpdate(liveArtisans);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'artisans');
    }
  );
}

export async function saveLiveArtisan(artisan: Artisan) {
  try {
    const docRef = doc(db, 'artisans', artisan.id);
    await setDoc(docRef, artisan, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `artisans/${artisan.id}`);
    throw err;
  }
}

// --- Live Proposals Real-Time Sync ---
export function subscribeLiveProposals(
  onUpdate: (proposals: ArtisanProposal[]) => void
) {
  const propCol = collection(db, 'proposals');

  return onSnapshot(
    propCol,
    async (snapshot) => {
      if (snapshot.empty) {
        for (const p of INITIAL_PROPOSALS) {
          try {
            await setDoc(doc(db, 'proposals', p.id), p);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `proposals/${p.id}`);
          }
        }
        return;
      }

      const liveProps: ArtisanProposal[] = [];
      snapshot.forEach((d) => {
        liveProps.push(d.data() as ArtisanProposal);
      });

      liveProps.sort((a, b) => b.id.localeCompare(a.id));
      onUpdate(liveProps);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'proposals');
    }
  );
}

export async function saveLiveProposal(proposal: ArtisanProposal) {
  try {
    const docRef = doc(db, 'proposals', proposal.id);
    await setDoc(docRef, proposal, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `proposals/${proposal.id}`);
    throw err;
  }
}

// --- Live Proposal Chats Real-Time Sync ---
export function subscribeLiveProposalChats(
  onUpdate: (chats: ArtisanProposalChat[]) => void
) {
  const chatCol = collection(db, 'proposalChats');

  return onSnapshot(
    chatCol,
    async (snapshot) => {
      if (snapshot.empty) {
        for (const c of INITIAL_PROPOSAL_CHATS) {
          try {
            await setDoc(doc(db, 'proposalChats', c.id), c);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `proposalChats/${c.id}`);
          }
        }
        return;
      }

      const liveChats: ArtisanProposalChat[] = [];
      snapshot.forEach((d) => {
        liveChats.push(d.data() as ArtisanProposalChat);
      });

      onUpdate(liveChats);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'proposalChats');
    }
  );
}

export async function saveLiveProposalChat(chat: ArtisanProposalChat) {
  try {
    const docRef = doc(db, 'proposalChats', chat.id);
    await setDoc(docRef, chat, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `proposalChats/${chat.id}`);
    throw err;
  }
}
