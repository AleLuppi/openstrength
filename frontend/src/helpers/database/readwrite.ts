import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

/**
 * Add a document to firestore db
 *
 * @param collectionName name of the collection where document shall be saved
 * @param data data that shall be sabed
 * @param addCurrentTimestamp if true, store saving timestamp along with data
 */
export async function doAddDoc(
  collectionName: string,
  data: { [key: string]: any },
  {
    addCurrentTimestamp = false,
    onSuccess,
    onError,
  }: {
    addCurrentTimestamp?: boolean;
    onSuccess?: Function;
    onError?: Function;
  } = {},
) {
  //
  Object.keys(data).forEach((key) => {
    data[key] = data[key] ?? null;
  });

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
