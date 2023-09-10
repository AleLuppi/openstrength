<template>
  <div class="q-pa-md">
    <q-form @submit="onSubmit" class="q-my-md q-gutter-sm column">
      <h3 class="text-primary">{{ $t("user.auth.signin_title") }}</h3>

      <q-input
        ref="emailInput"
        v-model="email"
        outlined
        type="email"
        label="Email"
        :rules="[
          (val) => (val && val.length > 2) || $t('user.auth.email_required'),
        ]"
        lazy-rules
        :error="emailError"
        :error-message="emailErrorMessage"
      />

      <q-input
        ref="passwordInput"
        v-model="password"
        outlined
        :type="passwordVisible ? 'text' : 'password'"
        label="Password"
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
      </q-input>

      <q-btn
        :label="$t('user.auth.login_button')"
        type="submit"
        color="primary"
      />
    </q-form>

    <router-link :to="{ name: 'register' }">{{
      $t("user.auth.signin_to_signup")
    }}</router-link>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useQuasar, QInput } from "quasar";
import { useI18n } from "vue-i18n";
import { User } from "firebase/auth";
import { AuthError, doSignInWithEmailAndPassword } from "@/helpers/users/auth";

const $q = useQuasar();
const i18n = useI18n();

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
</script>
