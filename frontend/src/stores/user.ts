import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { User as FirebaseUser } from "firebase/auth";

export const useUserStore = defineStore("user", () => {
  // Basic user info
  // From "UserInfo" interface https://firebase.google.com/docs/reference/js/auth.userinfo.md
  const uid = ref<String>("");
  const email = ref<String | null>(null);
  const displayName = ref<String | null>(null);
  const photoUrl = ref<String | null>(null);
  const phoneNumber = ref<String | null>(null);

  // Advanced user info
  // From "User" interface https://firebase.google.com/docs/reference/js/auth.user
  const emailVerified = ref<Boolean>(false);

  // User is signed in
  const isSignedIn = computed(() => Boolean(uid.value.trim()));

  /**
   * Update user storage from Firebase auth instance.
   *
   * @param user Firebase auth user to get info from.
   */
  function loadFirebaseUser(user: FirebaseUser) {
    uid.value = user.uid;
    email.value = user.email;
    displayName.value = user.displayName;
    photoUrl.value = user.photoURL;
    phoneNumber.value = user.phoneNumber;
    emailVerified.value = user.emailVerified;
  }

  /**
   * Reset value in user storage.
   */
  function $reset() {
    uid.value = "";
    email.value = null;
    displayName.value = null;
    photoUrl.value = null;
    phoneNumber.value = null;
    emailVerified.value = false;
  }

  return {
    uid,
    email,
    displayName,
    photoUrl,
    phoneNumber,
    emailVerified,
    isSignedIn,
    loadFirebaseUser,
    $reset,
  };
});
