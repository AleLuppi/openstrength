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
        {{ $t("user.auth.signup_title") }}
      </h3>

      <!-- Redirect to login -->
      <p>
        {{ $t("user.auth.already_registered") }}
        <router-link
          class="text-primary"
          :to="{ name: 'login', state: { insertedEmail: email } }"
        >
          {{ $t("user.auth.signup_to_signin") }}
        </router-link>
      </p>
    </div>

    <!-- Registration form -->
    <q-form class="column" @submit="onSubmit">
      <!-- Google Sign up -->
      <q-btn
        :label="$t('user.auth.register_with_google')"
        type="button"
        icon="fa-brands fa-google"
        class="q-my-md"
        @click="googleSignIn"
      />

      <!-- Text separator-->
      <osWrapWithLines class="q-my-sm text-xs">
        {{ $t("user.auth.signup_with_email") }}
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
          (val: string) => validateEmail(val) || $t('user.auth.email_invalid'),
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
        :rules="[
          (val: string) =>
            (val && validatePassword(val)) || $t('user.auth.password_invalid'),
        ]"
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

      <!-- Acceptance flag -->
      <div class="row items-center text-left text-xs">
        <q-toggle
          v-model="accept"
          checked-icon="check"
          color="green"
          unchecked-icon="clear"
        />

        <span class="col" style="min-width: 8em" @click="accept = !accept">
          {{ $t("user.auth.acceptance_before") }}

          <router-link :to="{ name: NamedRoutes.privacyPolicy }" @click.stop=""
            >{{ $t("layout.views.privacy_policy") }},
          </router-link>
          <router-link
            :to="{ name: NamedRoutes.cookiePolicy }"
            @click.stop=""
            >{{ $t("layout.views.cookie_policy") }}</router-link
          >{{ $t("user.auth.acceptance_between")
          }}<router-link
            :to="{ name: NamedRoutes.termsConditions }"
            @click.stop=""
            >{{ $t("layout.views.terms_conditions") }}</router-link
          >{{ $t("user.auth.acceptance_after") }}
        </span>
      </div>

      <q-btn
        :label="$t('user.auth.register_button')"
        outline
        color="button-primary"
        type="submit"
        class="q-my-lg"
      />
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
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
import { NamedRoutes } from "@/router";

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

// Perform operations on component mount
onMounted(() => {
  email.value = history.state?.insertedEmail ?? "";
});
</script>
