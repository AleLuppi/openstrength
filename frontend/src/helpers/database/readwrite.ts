import {
  doc,
  collection,
  query,
  addDoc,
  updateDoc,
  getDocs,
  deleteDoc,
  getDoc,
  where,
  serverTimestamp,
  DocumentData,
  Query,
  QuerySnapshot,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useUserStore } from "@/stores/user";
import { ErrorHandling } from "../ErrorHandling";

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
      userId: user.uid,
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
      userId: user.uid,
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
 * @param collectionName name of the collection where document shall be searched.
 * @param docId  id of the document to retrieve from the db.
 * @param errorHand to use to handle onSuccess or onError behaviours.
 */
export async function doGetOneDoc(
  collectionName: string,
  docId: string,
  errorHand: ErrorHandling = new ErrorHandling(),
) {
  const docRef = doc(db, collectionName, docId);
  await getDoc(docRef)
    .then((querySnapshot) => errorHand.onSuccess(querySnapshot.data()))
    .catch((error) => errorHand.onError(error));
}

/**
 * @param collectionName name of the collection where document shall be searched.
 * @param docId id of the document to retrieve from the db.
 * @param errorHand to use to handle onSuccess or onError behaviours.
 */
export async function doDocExists(
  collectionName: string,
  docId: string,
  errorHand: ErrorHandling = new ErrorHandling(),
) {
  const docRef = doc(db, collectionName, docId);
  return await getDoc(docRef)
    .then((querySnapshot) => errorHand.onSuccess(querySnapshot.exists()))
    .catch((error) => errorHand.onError(error));
}

/**
 * @param collectionName name of the collection where document shall be searched.
 * @param conditions put an object with the parameters used to filter the documents.
 * @param errorHand to use to handle onSuccess or onError behaviours.
 */
export async function doGetDocsWithObj(
  collectionName: string,
  conditions: any,
  errorHand: ErrorHandling = new ErrorHandling(),
) {
  const wheres = Object.keys(conditions).map((k) => {
    return where(k, "==", conditions[k]);
  });
  const q = query(collection(db, collectionName), ...wheres);

  return await getDocs(q)
    .then((querySnapshot) => errorHand.onSuccess(querySnapshot.docs[0].data()))
    .catch((error) => errorHand.onError(error));
}

/**
 * Retrieve documents from firebase db.
 *
 * @param collectionName name of the collection where document shall be searched.
 * @param conditions series of "where" conditions to filter documents.
 * @param onSuccess function to execute when write operation is successful.
 * @param onError function to execute when write operation fails.
 */
export async function doGetDocs(
  collectionName: string,
  conditions?: any[][],
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: Function;
    onError?: Function;
  } = {},
) {
  // Prepare query
  const filteredConditions = conditions?.filter((val) => val.length >= 3) ?? [];
  const wheres = filteredConditions.map((val) => where(val[0], val[1], val[2]));
  const q = query(collection(db, collectionName), ...wheres);

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
