<template>
  <div class="q-pa-md q-pb-lg q-mx-auto limit-max-width">
    <div class="column align-center justify-center">
      <!-- Logo -->
      <div class="image-container">
        <img :src="logoFullImage" alt="Logo" class="centered-image" />
      </div>
      <!-- Title -->
      <h2 class="text-center justify-center">
        {{ $t("user.auth.signup_title") }}
      </h2>
      <p class="text-center">
        {{ $t("user.auth.signup_subtitle") }}
      </p>

      <!-- Registration form -->
      <q-form @submit="onSubmit" class="q-my-xs q-gutter-xs column">
        <!-- 
        <os-input
          v-model="userName"
          type="text"
          :label="$t('user.auth.name')"
        />

        <os-input
          v-model="userSurname"
          type="text"
          :label="$t('user.auth.surname')"
        /> 
      -->

        <!-- Google Sign up -->
        <q-btn
          :label="$t('user.auth.register_with_google')"
          @click="googleSignIn"
          type="button"
          icon="fa-brands fa-google"
          class="q-my-md"
        />

        <!-- Text separator-->
        <div class="row">
          <hr />
          <p>{{ $t("user.auth.signup_with_email") }}</p>
          <hr />
        </div>

        <os-input
          ref="emailInput"
          v-model="email"
          required
          type="email"
          :label="$t('user.auth.email')"
          :rules="[
            (val: string) =>
              (val && val.length > 2) || $t('user.auth.email_required'),
            (val: string) =>
              validateEmail(val) || $t('user.auth.email_invalid'),
          ]"
          :error="emailError"
          :error-message="emailErrorMessage"
        />

        <os-input
          ref="passwordInput"
          v-model="password"
          required
          :type="passwordVisible ? 'text' : 'password'"
          :label="$t('user.auth.password')"
          :rules="[
            (val: string) =>
              (val && validatePassword(val)) ||
              $t('user.auth.password_invalid'),
          ]"
          :error="passwordError"
          :error-message="passwordErrorMessage"
        >
          <template v-slot:append>
            <q-icon
              :name="passwordVisible ? 'visibility' : 'visibility_off'"
              class="cursor-pointer"
              @click="passwordVisible = !passwordVisible"
            />
          </template>
        </os-input>

        <!-- Acceptance flag -->
        <div class="row items-center">
          <q-toggle
            v-model="accept"
            checked-icon="check"
            color="green"
            unchecked-icon="clear"
          />

          <span class="col" style="min-width: 8em">
            {{ $t("user.auth.acceptance_before")
            }}<router-link :to="{ name: 'privacy_policy' }" @click.stop="">{{
              $t("layout.views.privacy_policy")
            }}</router-link
            >{{ $t("user.auth.acceptance_between")
            }}<router-link :to="{ name: 'terms_conditions' }" @click.stop="">{{
              $t("layout.views.terms_conditions")
            }}</router-link
            >{{ $t("user.auth.acceptance_after") }}
          </span>
        </div>

        <q-btn
          :label="$t('user.auth.register_button')"
          outline
          type="submit"
          class="q-my-lg"
        />
      </q-form>

      <!-- Redirect to login -->
      <router-link :to="{ name: 'login' }">{{
        $t("user.auth.signup_to_signin")
      }}</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useQuasar, QInput } from "quasar";
import { useI18n } from "vue-i18n";
import { User } from "firebase/auth";
import {
  AuthError,
  doCreateUserWithEmailAndPassword,
  doSignInWithGoogle,
} from "@/helpers/users/auth";
import { validateEmail, validatePassword } from "@/helpers/validate";
import { logoFullImage } from "@/assets/sources";

// Init plugin
const $q = useQuasar();
const i18n = useI18n();

// Set ref
const emailInput = ref<QInput>();
const passwordInput = ref<QInput>();
//const userName = ref("");
//const userSurname = ref("");
const email = ref("");
const emailError = ref(false);
const emailErrorMessage = ref("");
const password = ref("");
const passwordError = ref(false);
const passwordErrorMessage = ref("");
const passwordVisible = ref(false);
const accept = ref(false);

// Clear external errors on user typing
watch(email, () => {
  emailError.value = false;
  emailErrorMessage.value = "";
});
watch(password, () => {
  passwordError.value = false;
  passwordErrorMessage.value = "";
});

/**
 * Google Authentication
 */
async function googleSignIn() {
  if (accept.value == true) {
    // TODO manage success and error
    doSignInWithGoogle({
      onSuccess: (result: any) => {
        console.log(result.user.uid);
      },
      onError: (error: any) => console.error(error),
    });
  } else {
    $q.notify({
      type: "negative",
      message: i18n.t("user.auth.acceptance_required"),
      position: "bottom",
    });
  }
}

/**
 * Submit form according to inputs' values
 */
function onSubmit() {
  if (accept.value == true) {
    // TODO add name and surname
    doCreateUserWithEmailAndPassword(
      email.value ?? "",
      password.value ?? "",
      true,
      onSubmitSuccess,
      onSubmitFailure,
    );
  } else {
    $q.notify({
      type: "negative",
      message: i18n.t("user.auth.acceptance_required"),
      position: "bottom",
    });
  }
}

/**
 * Manage successful form submit
 */
function onSubmitSuccess(user: User) {
  // TODO
  console.log(user.uid);
}

/**
 * Manage faulty form submit
 *
 * @param authError error that caused form submit failure
 */
function onSubmitFailure(authError: AuthError) {
  switch (authError) {
    case AuthError.userError:
      emailError.value = true;
      emailErrorMessage.value = i18n.t("user.auth.user_already_exist");
      emailInput.value?.focus();
      break;
    case AuthError.emailError:
      emailError.value = true;
      emailErrorMessage.value = i18n.t("user.auth.email_invalid");
      emailInput.value?.focus();
      break;
    case AuthError.passwordError:
      passwordError.value = true;
      passwordErrorMessage.value = i18n.t("user.auth.password_invalid");
      passwordInput.value?.focus();
      break;
    default:
      $q.notify({
        type: "negative",
        message: i18n.t("user.auth.signup_error"),
        position: "bottom",
      });
      break;
  }
}
</script>

<style scoped>
.image-container {
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.centered-image {
  max-width: 70%;
  max-height: 70%;
  width: auto;
  height: auto;
}

hr {
  height: 1px;
  width: 30%;
  border-width: 0;
  background-color: #bebebe;
}
</style>
