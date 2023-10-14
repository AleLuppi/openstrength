import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { User as FirebaseUser } from "firebase/auth";
import { User, CoachUser, AthleteUser } from "@/helpers/users/user";

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
   * Update user storage from Firebase auth instance.
   *
   * Basic user from "UserInfo" https://firebase.google.com/docs/reference/js/auth.userinfo.md
   * Advanced info from "User" interface https://firebase.google.com/docs/reference/js/auth.user
   *
   * @param user Firebase auth user to get info from.
   */
  function loadFirebaseUser(firebaseUser: FirebaseUser) {
    user.value = new User({
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? undefined,
      displayName: firebaseUser.displayName ?? undefined,
      photoUrl: firebaseUser.photoURL ?? undefined,
      phoneNumber: firebaseUser.phoneNumber ?? undefined,
      emailVerified: firebaseUser.emailVerified,
    });
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
    loadFirebaseUser,
    $reset,
  };
});
