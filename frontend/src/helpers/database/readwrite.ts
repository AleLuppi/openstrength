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
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useUserStore } from "@/stores/user";
import { objectDeepValueToValue } from "@/helpers/object";

/**
 * Add a document to firestore db.
 *
 * @param collectionName name of the collection where document shall be saved.
 * @param data data that shall be saved.
 * @param addUserId if provided, store ID of user in specified field, or under 'userId' if value true.
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
    undefinedToNull = true,
    onSuccess,
    onError,
  }: {
    addUserId?: boolean | string;
    addCurrentTimestamp?: boolean | string;
    undefinedToNull?: boolean;
    onSuccess?: (...x: any) => void;
    onError?: (...x: any) => void;
  } = {},
) {
  // Add user ID if required
  if (addUserId) {
    const user = useUserStore();
    data = {
      ...data,
      [addUserId === true ? "userId" : addUserId]: user.uid ?? undefined,
    };
  }

  // Parse undefined values as null
  if (undefinedToNull) data = objectDeepValueToValue(data, undefined, null);

  // Add timestamp if required
  if (addCurrentTimestamp)
    data = {
      ...data,
      [addCurrentTimestamp === true ? "datetime" : addCurrentTimestamp]:
        serverTimestamp(),
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
 * @param addUserId if provided, store ID of user in specified field, or under 'userId' if value true.
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
    undefinedToNull = true,
    onSuccess,
    onError,
  }: {
    addUserId?: boolean | string;
    addCurrentTimestamp?: boolean | string;
    undefinedToNull?: boolean;
    onSuccess?: (...x: any) => void;
    onError?: (...x: any) => void;
  } = {},
) {
  // Add user ID if required
  if (addUserId) {
    const user = useUserStore();
    data = {
      ...data,
      [addUserId === true ? "userId" : addUserId]: user.uid ?? undefined,
    };
  }

  // Parse undefined values as null
  if (undefinedToNull) data = objectDeepValueToValue(data, undefined, null);

  // Add timestamp if required
  if (addCurrentTimestamp)
    data = {
      ...data,
      [addCurrentTimestamp === true ? "datetime" : addCurrentTimestamp]:
        serverTimestamp(),
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
 * @param addUserId if provided, store ID of user in specified field, or under 'userId' if value true.
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
    undefinedToNull = true,
    onSuccess,
    onError,
  }: {
    addUserId?: boolean | string;
    addCurrentTimestamp?: boolean | string;
    undefinedToNull?: boolean;
    onSuccess?: (...x: any) => void;
    onError?: (...x: any) => void;
  } = {},
) {
  // Add user ID if required
  if (addUserId) {
    const user = useUserStore();
    data = {
      ...data,
      [addUserId === true ? "userId" : addUserId]: user.uid ?? undefined,
    };
  }

  // Parse undefined values as null
  if (undefinedToNull) data = objectDeepValueToValue(data, undefined, null);

  // Add timestamp if required
  if (addCurrentTimestamp)
    data = {
      ...data,
      [addCurrentTimestamp === true ? "datetime" : addCurrentTimestamp]:
        serverTimestamp(),
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
    nullToUndefined = true,
    onSuccess,
    onError,
  }: {
    nullToUndefined?: boolean;
    onSuccess?: (...x: any) => void;
    onError?: (...x: any) => void;
  } = {},
) {
  // Obtain document
  const docRef = doc(db, collectionName, docId);
  try {
    const documentSnapshot = await getDoc(docRef);
    let documentData = deepConvertTimestampToDate(documentSnapshot.data());
    if (nullToUndefined)
      documentData = documentData
        ? objectDeepValueToValue(documentData, null, undefined)
        : undefined;
    await onSuccess?.(documentData);
    return documentSnapshot;
  } catch (error) {
    console.error(error);
    onError?.(error);
  }
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
    nullToUndefined = true,
    onSuccess,
    onError,
  }: {
    ordering?: string[];
    numDocs?: number;
    nullToUndefined?: boolean;
    onSuccess?: (...x: any) => void;
    onError?: (...x: any) => void;
  } = {},
) {
  // Prepare query
  const filteredConditions = conditions?.filter((val) => val.length >= 3) ?? [];
  const wheres = filteredConditions.map((val) => where(val[0], val[1], val[2]));
  const orderBys = (ordering ?? []).map((val) =>
    val.startsWith("-") ? orderBy(val.slice(1), "desc") : orderBy(val),
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
      const docsData = querySnapshot.docs.reduce((obj, val) => {
        const data = val.data();
        if (data === undefined) return obj;
        let convertedData = deepConvertTimestampToDate(data);
        if (nullToUndefined)
          convertedData = objectDeepValueToValue(
            convertedData,
            null,
            undefined,
          );
        return { ...obj, [val.id]: convertedData };
      }, {});
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
    onSuccess?: (...x: any) => void;
    onError?: (...x: any) => void;
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
    onSuccess?: (...x: any) => void;
    onError?: (...x: any) => void;
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
    onSuccess?: (...x: any) => void;
    onError?: (...x: any) => void;
  } = {},
) {
  // TODO need to move subcollections as well

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

/**
 * Deep convert timestamps in a nested object to dates.
 *
 * @param data document where timestamps may be present.
 * @returns data with converted timestamps to date.
 */
function deepConvertTimestampToDate<T extends DocumentData | undefined>(
  data: T,
): T {
  if (data instanceof Object)
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof Timestamp) data[key] = value.toDate();
      deepConvertTimestampToDate(value);
    });
  return data;
}
