/**
 * User API file.
 *
 * Contains the methods used to store and retrieve
 * user data to and from database.
 */
import { User, type CoachUser, type AthleteUser } from './user';
import type { UserConfig } from './model';
import { DocumentReference } from 'firebase/firestore';
import {
  doAddDoc,
  doAddDocWithId,
  doUpdateDoc,
  doGetDocWithID,
  doGetDocs,
  changeDocId,
} from 'src/helpers/database/readwrite';
import {
  dbCollections,
  dbFixedIds,
  dbSubcollections,
} from 'src/helpers/database/collections';

/**********************/
/** WRITE OPERATIONS **/
/**********************/

/**
 * Store user on database.
 *
 * @param user user to store on database.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function addDocUser(
  user: User | CoachUser | AthleteUser,
  {
    onSuccess,
    onError,
  }: { onSuccess?: (...x: any) => void; onError?: (...x: any) => void } = {}
) {
  // Get user info
  const { uid: uid, config: config, ...userObj } = user;

  // Prepare a custom onSuccess callback
  const onSuccessWrap = (docRef: DocumentReference) => {
    onSuccess?.(docRef);
    if (!uid) user.uid = docRef.id;
    if (user.uid)
      addDocUserConfig(config ?? { payments: [], accessLevel: null }, user.uid);
  };

  // Crate user document
  if (uid)
    doAddDocWithId(dbCollections.users, uid, userObj, {
      onSuccess: onSuccessWrap,
      onError: onError,
    });
  else
    doAddDoc(dbCollections.users, userObj, {
      onSuccess: onSuccessWrap,
      onError: onError,
    });
}

/**
 * Store user config info on database.
 *
 * @param userConfig element to store on database.
 * @param userId reference user id where user configuration should be saved.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function addDocUserConfig(
  userConfig: UserConfig,
  userId: string,
  {
    onSuccess,
    onError,
  }: { onSuccess?: (...x: any) => void; onError?: (...x: any) => void } = {}
) {
  doAddDocWithId(
    `${dbCollections.users}/${userId}/${dbSubcollections.userConfig}`,
    dbFixedIds.userConfig,
    userConfig,
    {
      onSuccess: onSuccess,
      onError: onError,
    }
  );
}

/**
 * Update user on database.
 *
 * @param user user to store on database.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function updateDocUser(
  user: User | CoachUser | AthleteUser,
  {
    onSuccess,
    onError,
  }: { onSuccess?: (...x: any) => void; onError?: (...x: any) => void } = {}
) {
  const { uid: docId, ...userObj } = user;
  userObj.lastUpdated = new Date();
  if (docId)
    doUpdateDoc(dbCollections.users, docId, userObj, {
      onSuccess: (docRef: DocumentReference) => {
        onSuccess?.(docRef);
      },
      onError: onError,
    });
  else onError?.();
}

/*********************/
/** READ OPERATIONS **/
/*********************/

/**
 * Get the document related to a user.
 *
 * @param uid ID of the user whose document shall be retrieved.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 * @returns user instanced with data in document.
 */
export function loadDocUser(
  uid: string,
  {
    onSuccess,
    onError,
  }: { onSuccess?: (...x: any) => void; onError?: (...x: any) => void } = {}
) {
  // Get user
  return doGetDocWithID(dbCollections.users, uid, {
    onSuccess: async (userData: { [key: string]: any } | undefined) => {
      // Get user
      const user = userData ? new User({ uid: uid, ...userData }) : undefined;

      // Get user config
      await loadDocUserConfig(uid, {
        onSuccess: (userConfig: UserConfig) => {
          if (user) user.config = userConfig;
          onSuccess?.(user);
        },
      });
    },
    onError: onError,
  });
}

/**
 * Get the document related to a user configuration.
 *
 * @param uid ID of the user whose config document shall be retrieved.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 * @returns user instanced with data in document.
 */
export async function loadDocUserConfig(
  uid: string,
  {
    onSuccess,
    onError,
  }: { onSuccess?: (...x: any) => void; onError?: (...x: any) => void } = {}
) {
  // Get user config
  return doGetDocWithID(
    `${dbCollections.users}/${uid}/${dbSubcollections.userConfig}`,
    dbFixedIds.userConfig,
    {
      onSuccess: (userData: { [key: string]: any } | undefined) => {
        const userConfig = userData ? (userData as UserConfig) : undefined;
        onSuccess?.(userConfig);
      },
      onError: onError,
    }
  );
}

/**
 * Get the document of a user based on email field.
 *
 * @param field key of the field to check.
 * @param value value that the field must contain.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 * @returns data from user document or undefined if either 0 or more than 1 document were found (ambiguity).
 */
export async function getDocUserByField(
  field: string,
  value: string,
  {
    onSuccess,
    onError,
  }: { onSuccess?: (...x: any) => void; onError?: (...x: any) => void } = {}
) {
  // Get documents and select first one only
  let userDoc: { [key: string]: any } | undefined = undefined;
  await doGetDocs(dbCollections.users, [[field, '==', value]], {
    numDocs: 2,
    onSuccess: (docsData: { [key: string]: any }) => {
      userDoc = Object.keys(docsData).length == 1 ? docsData : undefined;
    },
    onError: onError,
  })
    .then(() => onSuccess?.(userDoc))
    .catch((error) => onError?.(error));
  return userDoc;
}

/**********************/
/** OTHER OPERATIONS **/
/**********************/

/**
 * Move a user document from an ID to a new one.
 *
 * @param oldId id of the document that must be updated.
 * @param newId new id of the document.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function changeDocUserId(
  oldId: string,
  newId: string,
  {
    onSuccess,
    onError,
  }: { onSuccess?: (...x: any) => void; onError?: (...x: any) => void } = {}
) {
  changeDocId(dbCollections.users, oldId, newId, {
    onSuccess: onSuccess,
    onError: onError,
  });
}
