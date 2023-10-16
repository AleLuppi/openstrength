import {
  doc,
  collection,
  query,
  addDoc,
  updateDoc,
  getDocs,
  deleteDoc,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useUserStore } from "@/stores/user";

/**
 * Add a document to firestore db.
 *
 * @param collectionName name of the collection where document shall be saved.
 * @param data data that shall be saved.
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
  // Translate from undefined data to null
  Object.keys(data).forEach((key) => {
    data[key] = data[key] ?? null;
  });

  // Add user ID if required
  if (addUserId) {
    const user = useUserStore();
    data = {
      ...data,
      userId: user.uid ?? null,
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
 * Update a document in firestore db.
 *
 * @param collectionName name of the collection where document shall be saved.
 * @param docId ID of the document that shall be updated.
 * @param data data that shall be saved.
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
  // Translate from undefined data to null
  Object.keys(data).forEach((key) => {
    data[key] = data[key] ?? null;
  });

  // Add user ID if required
  if (addUserId) {
    const user = useUserStore();
    data = {
      ...data,
      userId: user.uid ?? null,
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
  console.log(q);

  // Obtain documents
  await getDocs(q)
    .then((querySnapshot) => {
      const docsData = querySnapshot.docs.reduce(
        (obj, val) => ({ ...obj, [val.id]: val.data() }),
        {},
      );
      onSuccess?.(docsData);
    })
    .catch((error) => onError?.(error));
}

/**
 * Delete a document from firebase db.
 *
 * @param collectionName name of the collection where document shall be searched.
 * @param uid id of the document that shall be deleted.
 * @param onSuccess function to execute when write operation is successful.
 * @param onError function to execute when write operation fails.
 */
export async function doDeleteDoc(
  collectionName: string,
  uid: string,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: Function;
    onError?: Function;
  } = {},
) {
  // Remove document
  await deleteDoc(doc(db, collectionName, uid))
    .then(() => {
      onSuccess?.();
    })
    .catch((error) => onError?.(error));
}
