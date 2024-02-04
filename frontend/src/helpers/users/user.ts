import { DocumentReference } from "firebase/firestore";
import {
  doAddDoc,
  doAddDocWithId,
  doUpdateDoc,
  doGetDocWithID,
  doGetDocs,
  changeDocId,
} from "@/helpers/database/readwrite";
import {
  dbCollections,
  dbSubcollections,
} from "@/helpers/database/collections";

/**
 * Define available user roles.
 */
export enum UserRole {
  admin = "admin",
  coach = "coach",
  athlete = "athlete",
  unknown = "unknown",
}

/**
 * Define available user gender.
 */
export enum UserGender {
  male = "male",
  female = "female",
}

/**
 * User properties.
 */
export type UserProps = {
  // Default user info
  uid?: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
  phoneNumber?: string;

  // Advanced auth info
  emailVerified?: boolean;

  // Anagraphic
  name?: string;
  surname?: string;
  middlename?: string;
  gender?: UserGender;
  birthday?: Date;
  address?: string;

  // Account info
  createdOn?: Date;
  createdBy?: string;
  lastUpdated?: Date;
  locale?: string;

  // App specific
  role?: UserRole;
  lastAccess?: Date;
  lastNotificationRead?: Date;

  // Computed info
  referencename?: string;
  isSignedIn?: boolean;
};

/**
 * Coach user properties.
 */
export type CoachUserProps = UserProps & {
  // Coach specific
  sports?: string[];
  athletesNumberRange?: [number | undefined, number | undefined];
};

/**
 * Athlete user properties.
 */
export type AthleteUserProps = UserProps & {
  // Coach-related info
  coachId?: string;
  coachNote?: string;
  coaches?: string[];
  coachesFrom?: (Date | null)[];
  coachesTo?: (Date | null)[];
  assignedProgramId?: string;
  assignedPrograms?: string[];

  // Workout-related info
  height?: string;
  weight?: string;

  // Computed info
  hasProgramAssigned?: boolean;
};

/**
 * User entity.
 *
 * @public
 */
export class User {
  // Default user info
  uid?: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
  phoneNumber?: string;

  // Advanced auth info
  emailVerified?: boolean;

  // Anagraphic
  name?: string;
  surname?: string;
  middlename?: string;
  gender?: UserGender;
  birthday?: Date;
  address?: string;

  // Account info
  createdOn?: Date;
  createdBy?: string;
  lastUpdated?: Date;
  locale?: string;

  // App specific
  role: UserRole;
  lastAccess?: Date;
  lastNotificationRead?: Date;

  // Get user displayable name
  public get referenceName() {
    return this.displayName ?? [this.name, this.surname].join(" ");
  }

  // Check if user is signed in
  public get isSignedIn() {
    return Boolean(this.uid && this.uid.trim());
  }

  constructor({
    uid,
    email,
    displayName,
    photoUrl,
    phoneNumber,
    emailVerified,
    name,
    surname,
    middlename,
    gender,
    birthday,
    address,
    createdOn,
    createdBy,
    lastUpdated,
    locale,
    role,
    lastAccess,
    lastNotificationRead,
  }: UserProps = {}) {
    this.uid = uid;
    this.email = email;
    this.displayName = displayName;
    this.photoUrl = photoUrl;
    this.phoneNumber = phoneNumber;
    this.emailVerified = emailVerified;
    this.name = name;
    this.surname = surname;
    this.middlename = middlename;
    this.gender = gender;
    this.birthday = birthday;
    this.address = address;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.lastUpdated = lastUpdated;
    this.locale = locale;
    this.role = role ?? UserRole.unknown;
    this.lastAccess = lastAccess;
    this.lastNotificationRead = lastNotificationRead;
  }

  saveNew({
    user,
    onSuccess,
    onError,
  }: {
    user?: User | CoachUser | AthleteUser;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    addDocUser(user || this, { onSuccess: onSuccess, onError: onError });
  }

  saveUpdate({
    user,
    onSuccess,
    onError,
  }: {
    user?: User | CoachUser | AthleteUser;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    updateDocUser(user || this, { onSuccess: onSuccess, onError: onError });
  }
}

/**
 * Coach user.
 *
 * @public
 */
export class CoachUser extends User {
  // Coach specific
  sports?: string[];
  athletesNumberRange?: [number | undefined, number | undefined];

  constructor({ sports, athletesNumberRange, ...props }: CoachUserProps = {}) {
    // Set super properties
    const superProps = { ...props, role: UserRole.coach };
    super(superProps);

    // Set specific properties
    this.sports = sports;
    this.athletesNumberRange = athletesNumberRange;
  }
}

/**
 * Athlete user.
 *
 * @public
 */
export class AthleteUser extends User {
  // Coach-related info
  coachId?: string;
  coachNote?: string;
  coaches?: string[];
  coachesFrom?: (Date | null)[];
  coachesTo?: (Date | null)[];
  assignedProgramId?: string;
  assignedPrograms?: string[];

  // Workout-related info
  height?: string;
  weight?: string;

  // Check if athlete has any assigned program
  public get hasProgramAssigned() {
    return Boolean(this.assignedProgramId);
  }

  constructor({
    coachId,
    coachNote,
    coaches,
    coachesFrom,
    coachesTo,
    assignedProgramId,
    assignedPrograms,
    height,
    weight,
    ...props
  }: AthleteUserProps = {}) {
    // Set super properties
    const superProps = { ...props, role: UserRole.athlete };
    super(superProps);

    // Set specific properties
    this.coachId = coachId;
    this.coachNote = coachNote;
    this.coaches = coaches;
    this.coachesFrom = coachesFrom;
    this.coachesTo = coachesTo;
    this.assignedProgramId = assignedProgramId;
    this.assignedPrograms = assignedPrograms;
    this.height = height;
    this.weight = weight;
  }
}

/**
 * Config object to manage app blocks, access, and pricing tiers
 */
export type UserConfig = {
  pricingTier: PricingTier;
  payment: Payment;
  subscriptionLevel: "complete" | "1" | "2" | undefined;
  access: "enabled" | "disabled";
};

interface Payment {
  amount: number;
  date: Date;
  isPaid: boolean;
  tool:
    | "creditCard"
    | "bankTransfer"
    | "paypal"
    | "stripe"
    | "other"
    | undefined;
  totalPaidTillNow: number; //useful for estimating user LTV
}

interface PricingTier {
  name: string;
  price: number;
  billingCycle: "monthly" | "quarterly" | "annual" | "lifetime" | undefined;
  maxAthletes: number;
  expiringDate: Date;
}

/**
 * Store user on database.
 *
 * @param user user to store on database.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function addDocUser(
  user: User | CoachUser | AthleteUser,
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  // Get user info
  const { uid: uid, ...userObj } = user;

  // Crate user document
  if (uid)
    doAddDocWithId(dbCollections.users, uid, userObj, {
      onSuccess: (docRef: DocumentReference) => onSuccess?.(docRef),
      onError: onError,
    });
  else
    doAddDoc(dbCollections.users, userObj, {
      onSuccess: (docRef: DocumentReference) => {
        onSuccess?.(docRef);
        user.uid = docRef.id;
      },
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
  userConfigData: UserConfig,
  userId: string,
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  doAddDoc(
    `${dbCollections.users}/${userId}/${dbSubcollections.userConfig}`,
    userConfigData,
    {
      onSuccess: onSuccess,
      onError: onError,
    },
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
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
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

/**
 * Get the document related to a user.
 *
 * @param uid ID of the user whose document shall be retrieved.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 * @returns user instanced with data in document.
 */
export async function loadDocUser(
  uid: string,
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  // Get and update used info
  await doGetDocWithID(dbCollections.users, uid, {
    onSuccess: (userData: { [key: string]: any } | undefined) => {
      const user = userData ? new User({ uid: uid, ...userData }) : undefined;
      onSuccess?.(user);
    },
    onError: onError,
  });
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
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  // Get documents and select first one only
  let userDoc: { [key: string]: any } | undefined = undefined;
  await doGetDocs(dbCollections.users, [[field, "==", value]], {
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
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  changeDocId(dbCollections.users, oldId, newId, {
    onSuccess: onSuccess,
    onError: onError,
  });
}
