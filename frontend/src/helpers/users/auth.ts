import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
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

export function doSignOut(onSuccess?: Function, onError?: Function) {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      onSuccess?.();
    })
    .catch((error) => {
      // An error happened.
      onError?.();
    });
}

export function addCallbackOnAuthStateChanged(
  userIn?: Function,
  userOut?: Function,
) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      const uid = user.uid;

      // Callback registered function
      userIn?.(user);
    } else {
      // User is signed out
      userOut?.();
    }
  });
}
