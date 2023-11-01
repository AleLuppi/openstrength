import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { User as FirebaseUser } from "firebase/auth";
import {
  User,
  CoachUser,
  AthleteUser,
  loadDocUser,
  getDocUserByField,
  changeDocUserId,
} from "@/helpers/users/user";
import { objectAssignNotUndefined } from "@/helpers/object";

export const useUserStore = defineStore("user", () => {
  // Store user instance (private attribute)
  const user = ref<User | CoachUser | AthleteUser>();

  // Main user info, see User
  const uid = computed(() => user.value?.uid);
  const email = computed(() => user.value?.email);
  const displayName = computed(() => user.value?.displayName);
  const photoUrl = computed(() => user.value?.photoUrl);
  const phoneNumber = computed(() => user.value?.phoneNumber);
  const emailVerified = computed(() => user.value?.emailVerified);
  const name = computed(() => user.value?.name);
  const surname = computed(() => user.value?.surname);
  const middlename = computed(() => user.value?.middlename);
  const birthday = computed(() => user.value?.birthday);
  const address = computed(() => user.value?.address);
  const createdOn = computed(() => user.value?.createdOn);
  const createdBy = computed(() => user.value?.createdBy);
  const lastUpdated = computed(() => user.value?.lastUpdated);
  const locale = computed(() => user.value?.locale);
  const role = computed(() => user.value?.role);
  const lastAccess = computed(() => user.value?.lastAccess);
  const lastNotificationRead = computed(() => user.value?.lastNotificationRead);
  const isSignedIn = computed(() => user.value?.isSignedIn);

  /**
   * Load user data based on user ID.
   *
   * @param uid ID of the user that shall be loaded.
   * @param forceNew if true, force the creation of a new user, otherwise just try to update arguments.
   */
  function loadUser(uid?: string, forceNew?: boolean) {
    // Check user ID
    const docId = uid ?? user.value?.uid;
    if (!docId) return;

    // Try to load user
    loadDocUser(docId, {
      onSuccess: (docUser: User | undefined) => {
        if (docUser) {
          // Document found: assign to current user instance
          docUser.uid = docId;
          if (!user.value || forceNew) user.value = docUser;
          else objectAssignNotUndefined(user.value, docUser);
        } else {
          // Document not found: check if it can be retrieved by email
          if (user.value?.email)
            getDocUserByField("email", user.value.email, {
              onSuccess: (userDoc: { [key: string]: any } | undefined) => {
                if (userDoc) {
                  // Document found: need to clone it to a new ID, deleting this document
                  if (Object.keys(userDoc).length > 0 && user.value?.uid)
                    changeDocUserId(Object.keys(userDoc)[0], user.value.uid, {
                      onSuccess: () => loadUser(),
                    });
                } else {
                  // Document still not found: need to create one if user info are available
                  if (user.value) {
                    user.value.uid = docId;
                    user.value.saveNew();
                  }
                }
              },
            });
        }
      },
    });
  }

  /**
   * Update user storage from Firebase auth instance.
   *
   * Basic user from "UserInfo" https://firebase.google.com/docs/reference/js/auth.userinfo.md
   * Advanced info from "User" interface https://firebase.google.com/docs/reference/js/auth.user
   *
   * @param firebaseUser Firebase auth user to get info from.
   * @param forceNew if true, force the creation of a new user, otherwise just try to update arguments.
   */
  function loadFirebaseUser(firebaseUser: FirebaseUser, forceNew?: boolean) {
    // Get user info and assign them to user instance
    const userObj = {
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? undefined,
      displayName: firebaseUser.displayName ?? undefined,
      photoUrl: firebaseUser.photoURL ?? undefined,
      phoneNumber: firebaseUser.phoneNumber ?? undefined,
      emailVerified: firebaseUser.emailVerified,
    };
    if (!user.value || forceNew) user.value = new User(userObj);
    else objectAssignNotUndefined(user.value, userObj);
  }

  /**
   * Reset values in user storage.
   */
  function $reset() {
    user.value = undefined;
  }

  return {
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
    isSignedIn,
    loadUser,
    loadFirebaseUser,
    $reset,
  };
});
