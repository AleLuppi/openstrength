import { DocumentReference } from "firebase/firestore";
import { doAddDoc, doUpdateDoc } from "@/helpers/database/readwrite";
import { usersCollection } from "../database/collections";

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
  isSignedIn?: boolean;
};

/**
 * Coach user properties.
 */
export type CoachUserProps = UserProps & {
  sports?: string[];
  athletesRange?: string[];
};

/**
 * Athlete user properties.
 */
export type AthleteUserProps = UserProps & {
  // Athlete specific
  coachId?: string;
  coachNote?: string;
  coaches?: string[];
  coachesFrom?: (Date | null)[];
  coachesTo?: (Date | null)[];
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
    this.name = name;
    this.surname = surname;
    this.middlename = middlename;
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
  athletesRange?: string[];

  constructor({ sports, athletesRange, ...props }: CoachUserProps = {}) {
    // Set super properties
    const superProps = { ...props, role: UserRole.coach };
    super(superProps);

    // Set specific properties
    this.sports = sports;
    this.athletesRange = athletesRange;
  }
}

/**
 * Athlete user.
 *
 * @public
 */
export class AthleteUser extends User {
  // Athlete specific
  coachId?: string;
  coachNote?: string;
  coaches?: string[];
  coachesFrom?: (Date | null)[];
  coachesTo?: (Date | null)[];

  constructor({
    coachId,
    coachNote,
    coaches,
    coachesFrom,
    coachesTo,
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
  }
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
  const { uid: _, ...userObj } = user;
  doAddDoc(usersCollection, userObj, {
    onSuccess: (docRef: DocumentReference) => {
      onSuccess?.();
      user.uid = docRef.id;
    },
    onError: onError,
  });
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
    doUpdateDoc(usersCollection, docId, userObj, {
      onSuccess: (docRef: DocumentReference) => {
        onSuccess?.(docRef);
      },
      onError: onError,
    });
  else onError?.();
}
