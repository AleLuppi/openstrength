<template>
  <q-page class="q-pa-md">
    <!-- Profile info card-->
    <q-card class="q-mb-lg q-pb-sm">
      <h6 class="q-mx-md q-py-sm">{{ $t("user.profile.info_title") }}</h6>

      <div class="row justify-around">
        <!-- Profile Image-->
        <div class="column align-left q-mx-md">
          <q-img
            v-if="photoUrl"
            :src="photoUrl"
            :size="$q.screen.lt.sm ? '3em' : '6em'"
            width="96px"
            height="96px"
            class="justify-center q-ma-sm"
            style="border-radius: 50%"
            @error="photoUrl = undefined"
          />
          <q-icon
            v-else
            name="account_circle"
            :size="$q.screen.lt.sm ? '3em' : '6em'"
            class="justify-center card-icon q-ma-sm"
          />
        </div>

        <!-- Name and Surname -->
        <div class="column align-center q-mx-md">
          <p class="text-h6 text-left">
            {{ $t("user.profile.name") }}
          </p>
          <p class="text-left">{{ user.displayName }}</p>
        </div>

        <!-- Email -->
        <div class="column align-center q-mx-md">
          <p class="text-h6 text-left">
            {{ $t("user.profile.email") }}
          </p>
          <p class="text-left">{{ user.email }}</p>
        </div>

        <!-- Role: athlete or coach -->
        <div class="column align-center q-mx-md">
          <p class="text-h6 text-left">
            {{ $t("user.profile.role") }}
          </p>
          <p class="text-left text-primary">{{ user.role }}</p>
        </div>
      </div>
    </q-card>

    <!-- Useful links card -->
    <q-card class="q-mb-lg q-pb-md">
      <h6 class="q-mx-md q-py-sm">{{ $t("user.profile.link_title") }}</h6>

      <div :class="$q.screen.lt.sm ? 'column q-ml-md' : 'row justify-around'">
        <router-link :to="{ name: NamedRoutes.privacyPolicy }">{{
          $t("user.profile.privacy_link")
        }}</router-link>

        <router-link :to="{ name: NamedRoutes.cookiePolicy }">{{
          $t("user.profile.cookie_link")
        }}</router-link>

        <router-link :to="{ name: NamedRoutes.termsConditions }">{{
          $t("user.profile.terms_link")
        }}</router-link>
      </div>
    </q-card>

    <q-btn
      color="button-secondary"
      :label="$t('user.auth.signout_title')"
      @click="signOut"
    />

    <q-badge
      color="secondary"
      outline
      class="q-ma-sm"
      style="position: absolute; bottom: 0px; right: 0px"
    >
      {{ appVersion }}
    </q-badge>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/stores/user";
import { doSignOut } from "@/helpers/users/auth";
import { NamedRoutes } from "@/router";

// Init plugin
const $q = useQuasar();
const i18n = useI18n();

// Get user state
const user = useUserStore();

// Get profile picture url
const photoUrl = computed(() => user.photoUrl);

// Get app version
const appVersion = process.env.VITE_APP_VERSION;

/**
 * Sign out user.
 */
function signOut() {
  doSignOut({
    onError: () => {
      $q.notify({
        type: "negative",
        message: i18n.t("user.auth.signout_error"),
        position: "bottom",
      });
    },
  });
}
</script>
