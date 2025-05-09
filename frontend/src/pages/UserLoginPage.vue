<template>
  <q-page
    class="q-pa-sm q-pb-lg q-mx-auto limit-max-width column justify-center"
  >
    <!-- Logo -->
    <div class="full-width text-center">
      <img :src="logoFullImage" :srcset="logoFullImage + ' 1.2x'" alt="Logo" />
    </div>

    <!-- Title -->
    <div class="text-center q-pt-sm q-pb-lg">
      <h3 class="q-my-xs">
        {{ $t("user.auth.signin_title") }}
      </h3>

      <!-- Redirect to registration -->
      <p v-if="false">
        {{ $t("user.auth.without_account") }}
        <router-link
          class="text-primary"
          :to="{ name: 'register', state: { insertedEmail: email } }"
        >
          {{ $t("user.auth.signin_to_signup") }}
        </router-link>
      </p>
    </div>

    <!-- Access form -->
    <q-form class="column" @submit="onSubmit">
      <!-- Google Sign up -->
      <q-btn
        :label="$t('user.auth.signin_with_google')"
        icon="fa-brands fa-google"
        class="q-my-md"
        @click="googleSignIn"
      />

      <!-- Text separator-->
      <osWrapWithLines class="q-my-sm text-xs">
        {{ $t("user.auth.signin_with_email") }}
      </osWrapWithLines>

      <os-input
        ref="emailInput"
        v-model="email"
        required
        type="email"
        :label="$t('user.auth.email')"
        :rules="[
          (val: string) =>
            (val && val.length > 2) || $t('user.auth.email_required'),
        ]"
        :error="emailError"
        :error-message="emailErrorMessage"
        class="q-mt-sm"
      />

      <os-input
        ref="passwordInput"
        v-model="password"
        required
        :type="passwordVisible ? 'text' : 'password'"
        :label="$t('user.auth.password')"
        :error="passwordError"
        :error-message="passwordErrorMessage"
      >
        <template #append>
          <q-icon
            :name="passwordVisible ? 'visibility' : 'visibility_off'"
            class="cursor-pointer"
            @click="passwordVisible = !passwordVisible"
          />
        </template>
      </os-input>

      <q-btn
        :label="$t('user.auth.login_button')"
        type="submit"
        outline
        class="q-my-lg"
      />
    </q-form>

    <div class="row justify-between">
      <!-- Forgot password -->
      <router-link :to="{ name: 'register' }">{{
        $t("user.auth.forgot_password")
      }}</router-link>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useQuasar, QInput } from "quasar";
import { useI18n } from "vue-i18n";
import { User } from "firebase/auth";
import {
  AuthError,
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
} from "@/helpers/users/auth";
import { logoFullImage } from "@/assets/sources";

// Init plugin
const $q = useQuasar();
const i18n = useI18n();

// Set ref
const emailInput = ref<QInput>();
const passwordInput = ref<QInput>();
const email = ref("");
const emailError = ref(false);
const emailErrorMessage = ref("");
const password = ref("");
const passwordError = ref(false);
const passwordErrorMessage = ref("");
const passwordVisible = ref(false);

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
  // TODO
  doSignInWithGoogle({
    onSuccess: (result: any) => {
      console.log(result.user.uid);
    },
    onError: (error: any) => console.error(error),
  });
}

/**
 * Submit form according to inputs' values
 */
function onSubmit() {
  doSignInWithEmailAndPassword(
    email.value ?? "",
    password.value ?? "",
    onSubmitSuccess,
    onSubmitFailure,
  );
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
      emailErrorMessage.value = i18n.t("user.auth.user_not_exist");
      emailInput.value?.focus();
      break;
    case AuthError.emailError:
      emailError.value = true;
      emailErrorMessage.value = i18n.t("user.auth.email_invalid");
      emailInput.value?.focus();
      break;
    case AuthError.passwordError:
      passwordError.value = true;
      passwordErrorMessage.value = i18n.t("user.auth.password_wrong");
      passwordInput.value?.focus();
      break;
    default:
      $q.notify({
        type: "negative",
        message: i18n.t("user.auth.signin_error"),
        position: "bottom",
      });
      break;
  }
}

// Perform operations on component mount
onMounted(() => {
  email.value = history.state?.insertedEmail ?? "";
});
</script>
