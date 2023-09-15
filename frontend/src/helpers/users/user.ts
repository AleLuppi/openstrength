import { DocumentReference } from "firebase/firestore";
import { doAddDoc } from "@/helpers/database/readwrite";

enum UserRole {
  admin = "admin",
  coach = "coach",
  athlete = "athlete",
  unknown = "unknown",
}

// DB collection where users are stored
export const userCollection = "users";

/**
 * User entity.
 *
 * @public
 */
export class User {
  // Connect to DB info
  uid?: string;

  // Anagraphic
  name?: string;
  surname?: string;
  middlename?: string;
  birthday?: Date;
  address?: string;

  // Account info
  createdOn?: Date;
  createdBy?: string;
  locale?: string;

  // App specific
  role: UserRole;
  lastAccess?: Date;
  lastNotificationRead?: Date;

  constructor({
    uid,
    name,
    surname,
    middlename,
    birthday,
    address,
    createdOn,
    createdBy,
    locale,
    role,
    lastAccess,
    lastNotificationRead,
  }: {
    uid?: string;
    name?: string;
    surname?: string;
    middlename?: string;
    birthday?: Date;
    address?: string;
    createdOn?: Date;
    createdBy?: string;
    locale?: string;
    role?: UserRole;
    lastAccess?: Date;
    lastNotificationRead?: Date;
  } = {}) {
    this.uid = uid;
    this.name = name;
    this.surname = surname;
    this.middlename = middlename;
    this.birthday = birthday;
    this.address = address;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.locale = locale;
    this.role = role ?? UserRole.unknown;
    this.lastAccess = lastAccess;
    this.lastNotificationRead = lastNotificationRead;
  }
}

/**
 * Coach user.
 *
 * @public
 */
export class CoachUser extends User {
  constructor(props?: {}) {
    // Set super properties
    const superProps = { ...props, role: UserRole.coach };
    super(superProps);

    // Set specific properties
  }
}

/**
 * Coach user.
 *
 * @public
 */
export class AthleteUser extends User {
  // Athlete specific
  coachId?: string;
  coachNote?: string;

  constructor({
    coachId,
    coachNote,
    ...props
  }: { coachId?: string; coachNote?: string } = {}) {
    // Set super properties
    const superProps = { ...props, role: UserRole.athlete };
    super(superProps);

    // Set specific properties
    this.coachId = coachId;
    this.coachNote = coachNote;
  }
}

/**
 * Store user on database.
 *
 * @param user user to store on database.
 */
export function addDocUser(user: User | CoachUser | AthleteUser) {
  const { uid: _, ...userObj } = user;
  console.log(userObj);
  doAddDoc(userCollection, userObj, {
    onSuccess: (docRef: DocumentReference) => (user.uid = docRef.id),
  });
}
