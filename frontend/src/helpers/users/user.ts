import { UserConfig } from "@/helpers/users/model";
import { addDocUser, updateDocUser } from "./api";

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

  // Whether user instance does not relate to a real person
  isDummy?: boolean;

  // Computed info
  referencename?: string;
  isSignedIn?: boolean;

  /**
   * User Config.
   */
  config?: UserConfig;
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

  /**
   * User config.
   */
  config?: UserConfig;

  // Whether user instance does not relate to a real person
  isDummy?: boolean;

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
    config,
    isDummy,
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
    this.config = config;
    this.isDummy = isDummy;
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
