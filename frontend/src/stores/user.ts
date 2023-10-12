import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { User as FirebaseUser } from "firebase/auth";
import { UserRole } from "@/helpers/users/user";

export const useUserStore = defineStore("user", () => {
  // Basic user info
  // From "UserInfo" interface https://firebase.google.com/docs/reference/js/auth.userinfo.md
  const uid = ref<string>();
  const email = ref<string>();
  const displayName = ref<string>();
  const photoUrl = ref<string>();
  const phoneNumber = ref<string>();

  // Advanced user info
  // From "User" interface https://firebase.google.com/docs/reference/js/auth.user
  const emailVerified = ref<Boolean>(false);

  // User is signed in
  const isSignedIn = computed(() => Boolean(uid.value && uid.value.trim()));

  // Additional user info for personalization
  const name = ref<string>();
  const role = ref<UserRole>();

  /**
   * Update user storage from Firebase auth instance.
   *
   * @param user Firebase auth user to get info from.
   */
  function loadFirebaseUser(user: FirebaseUser) {
    uid.value = user.uid;
    email.value = user.email ?? undefined;
    displayName.value = user.displayName ?? undefined;
    photoUrl.value = user.photoURL ?? undefined;
    phoneNumber.value = user.phoneNumber ?? undefined;
    emailVerified.value = user.emailVerified;
  }

  /**
   * Reset values in user storage.
   */
  function $reset() {
    uid.value = undefined;
    email.value = undefined;
    name.value = undefined;
    displayName.value = undefined;
    role.value = undefined;
    photoUrl.value = undefined;
    phoneNumber.value = undefined;
    emailVerified.value = false;
  }

  return {
    uid,
    email,
    name,
    displayName,
    role,
    photoUrl,
    phoneNumber,
    emailVerified,
    isSignedIn,
    loadFirebaseUser,
    $reset,
  };
});
