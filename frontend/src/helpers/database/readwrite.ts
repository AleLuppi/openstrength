import {
  doc,
  collection,
  query,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
  where,
  orderBy,
  limit,
  serverTimestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useUserStore } from "@/stores/user";

/**
 * Add a document to firestore db.
 *
 * @param collectionName name of the collection where document shall be saved.
 * @param data data that shall be saved.
 * @param addUserId if true, store ID of user making write request in new document.
 * @param addCurrentTimestamp if true, store saving timestamp along with data.
 * @param onSuccess function to execute when write operation is successful.
 * @param onError function to execute when write operation fails.
 */
export async function doAddDoc(
  collectionName: string,
  data: { [key: string]: any },
  {
    addUserId = false,
    addCurrentTimestamp = false,
    onSuccess,
    onError,
  }: {
    addUserId?: boolean;
    addCurrentTimestamp?: boolean;
    onSuccess?: Function;
    onError?: Function;
  } = {},
) {
  // Add user ID if required
  if (addUserId) {
    const user = useUserStore();
    data = {
      ...data,
      userId: user.uid ?? undefined,
    };
  }

  // Add timestamp if required
  if (addCurrentTimestamp)
    data = {
      ...data,
      datetime: serverTimestamp(),
    };

  // Create doc
  await addDoc(collection(db, collectionName), data)
    .then((docRef) => onSuccess?.(docRef))
    .catch((error) => {
      // Failed document write
      console.error(error);
      onError?.(error);
    });
}

/**
 * Add a document with a specific ID to firestore db.
 *
 * @param collectionName name of the collection where document shall be saved.
 * @param docId specific ID to use to create the new document.
 * @param data data that shall be saved.
 * @param addUserId if true, store ID of user making write request in new document.
 * @param addCurrentTimestamp if true, store saving timestamp along with data.
 * @param onSuccess function to execute when write operation is successful.
 * @param onError function to execute when write operation fails.
 */
export async function doAddDocWithId(
  collectionName: string,
  docId: string,
  data: any,
  {
    addUserId = false,
    addCurrentTimestamp = false,
    onSuccess,
    onError,
  }: {
    addUserId?: boolean;
    addCurrentTimestamp?: boolean;
    onSuccess?: Function;
    onError?: Function;
  } = {},
) {
  // Add user ID if required
  if (addUserId) {
    const user = useUserStore();
    data = {
      ...data,
      userId: user.uid ?? undefined,
    };
  }

  // Add timestamp if required
  if (addCurrentTimestamp)
    data = {
      ...data,
      datetime: serverTimestamp(),
    };

  // Create doc
  const docRef = doc(db, collectionName, docId);
  await setDoc(docRef, data)
    .then((docRef) => onSuccess?.(docRef))
    .catch((error) => {
      // Failed document write
      console.error(error);
      onError?.(error);
    });
}

/**
 * Update a document in firestore db.
 *
 * @param collectionName name of the collection where document shall be saved.
 * @param docId ID of the document that shall be updated.
 * @param data data that shall be saved.
 * @param addUserId if true, store ID of user making write request in new document.
 * @param addCurrentTimestamp if true, store saving timestamp along with data.
 * @param onSuccess function to execute when write operation is successful.
 * @param onError function to execute when write operation fails.
 */
export async function doUpdateDoc(
  collectionName: string,
  docId: string,
  data: { [key: string]: any },
  {
    addUserId = false,
    addCurrentTimestamp = false,
    onSuccess,
    onError,
  }: {
    addUserId?: boolean;
    addCurrentTimestamp?: boolean;
    onSuccess?: Function;
    onError?: Function;
  } = {},
) {
  // Add user ID if required
  if (addUserId) {
    const user = useUserStore();
    data = {
      ...data,
      userId: user.uid ?? undefined,
    };
  }

  // Add timestamp if required
  if (addCurrentTimestamp)
    data = {
      ...data,
      datetime: serverTimestamp(),
    };

  // Update doc
  await updateDoc(doc(db, collectionName, docId), data)
    .then((docRef) => onSuccess?.(docRef))
    .catch((error) => {
      // Failed document update
      console.error(error);
      onError?.(error);
    });
}

/**
 * Retrieve a specific document from db.
 *
 * @param collectionName name of the collection where document is.
 * @param docId ID of the document that shall be retrieved.
 * @param onSuccess function to execute when write operation is successful.
 * @param onError function to execute when write operation fails.
 */
export async function doGetDocWithID(
  collectionName: string,
  docId: string,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: Function;
    onError?: Function;
  } = {},
) {
  // Obtain document
  const docRef = doc(db, collectionName, docId);
  await getDoc(docRef)
    .then((documentSnapshot) => onSuccess?.(documentSnapshot.data()))
    .catch((error) => {
      console.error(error);
      onError?.(error);
    });
}

/**
 * Retrieve documents from firebase db.
 *
 * @param collectionName name of the collection where document shall be searched.
 * @param conditions series of "where" conditions to filter documents.
 * @param ordering fields by which order results, prefixed by '-' if decrescent order.
 * @param numDocs maximum number of documents returned.
 * @param onSuccess function to execute when write operation is successful.
 * @param onError function to execute when write operation fails.
 */
export async function doGetDocs(
  collectionName: string,
  conditions?: any[][],
  {
    ordering,
    numDocs,
    onSuccess,
    onError,
  }: {
    ordering?: string[];
    numDocs?: number;
    onSuccess?: Function;
    onError?: Function;
  } = {},
) {
  // Prepare query
  const filteredConditions = conditions?.filter((val) => val.length >= 3) ?? [];
  const wheres = filteredConditions.map((val) => where(val[0], val[1], val[2]));
  const orderBys = (ordering ?? []).map((val) =>
    val.startsWith("-") ? orderBy(val, "desc") : orderBy(val),
  );
  const limits = numDocs ? [limit(numDocs)] : [];
  const q = query(
    collection(db, collectionName),
    ...wheres,
    ...orderBys,
    ...limits,
  );

  // Obtain documents
  await getDocs(q)
    .then((querySnapshot) => {
      const docsData = querySnapshot.docs.reduce(
        (obj, val) =>
          val.data() !== undefined ? { ...obj, [val.id]: val.data() } : obj,
        {},
      );
      onSuccess?.(docsData);
    })
    .catch((error) => {
      console.error(error);
      onError?.(error);
    });
}

/**
 * Delete a document from firebase db.
 *
 * @param collectionName name of the collection where document shall be searched.
 * @param docId ID of the document that shall be deleted.
 * @param onSuccess function to execute when write operation is successful.
 * @param onError function to execute when write operation fails.
 */
export async function doDeleteDoc(
  collectionName: string,
  docId: string,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: Function;
    onError?: Function;
  } = {},
) {
  // Remove document
  deleteDoc(doc(db, collectionName, docId))
    .then(() => {
      onSuccess?.();
    })
    .catch((error) => {
      console.error(error);
      onError?.(error);
    });
}

/**
 * Check if a specific document exists.
 *
 * @param collectionName name of the collection where document shall be searched.
 * @param docId id of the document to retrieve from the db.
 * @param onSuccess function to execute when write operation is successful.
 * @param onError function to execute when write operation fails.
 */
export async function checkDocExists(
  collectionName: string,
  docId: string,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: Function;
    onError?: Function;
  } = {},
) {
  // Check if document exists
  const docRef = doc(db, collectionName, docId);
  return await getDoc(docRef)
    .then((documentSnapshot) => onSuccess?.(documentSnapshot.exists()))
    .catch((error) => onError?.(error));
}

/**
 * Move a document from one ID to a different one.
 *
 * Under the hood, the function does:
 * - read the original document;
 * - create a new document with the same content but a different ID.
 * - delete the original document.
 * User shall then be able to access DB to: read, create, delete a document.
 *
 * @param collectionName name of the collection where document is stored.
 * @param oldId id of the document that must be updated.
 * @param newId new id of the document.
 * @param onSuccess function to execute when write operation is successful.
 * @param onError function to execute when write operation fails.
 */
export async function changeDocId(
  collectionName: string,
  oldId: string,
  newId: string,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: Function;
    onError?: Function;
  } = {},
) {
  // Retrieve doc data
  doGetDocWithID(collectionName, oldId, {
    onError: onError,
    onSuccess: (data: DocumentData | undefined) => {
      // No data found, exit
      if (!data) {
        onSuccess?.(false);
        return;
      }

      // Save data on new document
      doAddDocWithId(collectionName, newId, data, {
        onError: onError,
        onSuccess: () => {
          // Delete previous document
          doDeleteDoc(collectionName, oldId, {
            onError: onError,
            onSuccess: () => onSuccess?.(true),
          });
        },
      });
    },
  });
}
