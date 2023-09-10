import { ref, computed, Ref } from "vue";
import { defineStore } from "pinia";
import { User } from "firebase/auth";

export const useUserStore = defineStore("user", () => {
  // From "UserInfo" interface https://firebase.google.com/docs/reference/js/auth.userinfo.md
  const uid = ref<String>("");
  const email = ref<String | null>(null);
  const displayName = ref<String | null>(null);
  const photoUrl = ref<String | null>(null);
  const phoneNumber = ref<String | null>(null);

  // From "User" interface https://firebase.google.com/docs/reference/js/auth.user
  const emailVerified = ref<Boolean>(false);

  const isSignedIn = computed(() => Boolean(uid.value.trim()));

  function loadFirebaseUser(user: User) {
    uid.value = user.uid;
    email.value = user.email;
    displayName.value = user.displayName;
    photoUrl.value = user.photoURL;
    phoneNumber.value = user.phoneNumber;
    emailVerified.value = user.emailVerified;
  }

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
