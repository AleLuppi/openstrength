import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/firebase";

export enum AuthError {
  emailError,
  passwordError,
  userError,
  genericError,
}

export function doCreateUserWithEmailAndPassword(
  email: string,
  password: string,
  requireEmailVerification: boolean = false,
  onSuccess?: Function,
  onError?: Function,
) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;

      // Send verification email
      if (requireEmailVerification)
        sendEmailVerification(user).then(() => {
          // Email verification sent
          onSuccess?.(user);
        });
      else onSuccess?.(user);
    })
    .catch((error) => {
      // Failed sign-up
      let authError;
      switch (error.code) {
        case "auth/email-already-in-use":
          authError = AuthError.userError;
          break;
        case "auth/invalid-email":
          authError = AuthError.emailError;
          break;
        case "auth/operation-not-allowed":
          authError = AuthError.genericError;
          break;
        case "auth/weak-password":
          authError = AuthError.passwordError;
          break;
        default:
          authError = AuthError.genericError;
          break;
      }

      onError?.(authError);
    });
}

export function doSignInWithEmailAndPassword(
  email: string,
  password: string,
  onSuccess?: Function,
  onError?: Function,
) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;

      onSuccess?.(user);
    })
    .catch((error) => {
      // Failed sign-in
      let authError;
      switch (error.code) {
        case "auth/wrong-password":
          authError = AuthError.passwordError;
          break;
        case "auth/invalid-email":
          authError = AuthError.emailError;
          break;
        case "auth/user-disabled":
          authError = AuthError.userError;
          break;
        case "auth/user-not-found":
          authError = AuthError.userError;
          break;
        default:
          authError = AuthError.genericError;
          break;
      }

      onError?.(authError);
    });
}

/**
 * Sign in using Google auth provider.
 *
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function doSignInWithGoogle({
  onSuccess,
  onError,
}: {
  onSuccess?: Function;
  onError?: Function;
} = {}) {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => onSuccess?.(result))
    .catch((error) => onError?.(error));
}

export function doSignOut({
  onSuccess,
  onError,
}: {
  onSuccess?: Function;
  onError?: Function;
} = {}) {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      onSuccess?.();
    })
    .catch((error) => {
      // An error happened.
      onError?.(error);
    });
}

/**
 * Register callback triggered on auth state change.
 *
 * @param onUserIn function to call when user signs in.
 * @param onUserOut function to call when user signs out.
 * @param onUserChange function to call at any auth change.
 */
export function addCallbackOnAuthStateChanged({
  onUserIn,
  onUserOut,
  onUserChange,
}: {
  onUserIn?: Function;
  onUserOut?: Function;
  onUserChange?: Function;
} = {}) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user

      // Callback registered function
      onUserIn?.(user);
    } else {
      // User is signed out
      onUserOut?.();
    }

    // Auth state changed
    onUserChange?.();
  });
}
