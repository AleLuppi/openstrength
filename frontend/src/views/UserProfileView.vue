<template>
  <q-page class="q-pa-md">
    <h2>{{ $t("user.profile.profile_title") }}</h2>

    <!-- Profile info card-->
    <q-card class="q-mb-lg">
      <h6 class="q-mx-md q-py-md">{{ $t("user.profile.info_title") }}</h6>

      <div class="row justify-around">
        <!-- Profile Image-->
        <q-section class="column align-left q-mx-md">
          <q-img
            v-if="photoUrl"
            :src="photoUrl"
            size="6em"
            width="96px"
            height="96px"
            class="justify-center q-ma-sm"
            style="border-radius: 50%"
            @error="photoUrl = undefined"
          />
          <q-icon
            v-else
            name="account_circle"
            size="6em"
            class="justify-center card-icon q-ma-sm"
          />
        </q-section>

        <!-- Name and Surname -->
        <q-section class="column align-center q-mx-md">
          <p class="text-h6 text-left">
            {{ $t("user.profile.name") }}
          </p>
          <p class="text-left">{{ user.displayName }}</p>
        </q-section>

        <!-- Email -->
        <q-section class="column align-center q-mx-md">
          <p class="text-h6 text-left">
            {{ $t("user.profile.email") }}
          </p>
          <p class="text-left">{{ user.email }}</p>
        </q-section>

        <!-- Role: athlete or coach -->
        <q-section class="column align-center q-mx-md">
          <p class="text-h6 text-left">
            {{ $t("user.profile.role") }}
          </p>
          <p class="text-left text-primary">{{ user.role }}</p>
        </q-section>
      </div>
    </q-card>

    <!-- Useful links card -->
    <q-card class="q-mb-lg q-pb-md">
      <h6 class="q-mx-md q-py-md">{{ $t("user.profile.link_title") }}</h6>

      <div class="row justify-around">
        <router-link :to="{ name: 'privacy_policy' }">{{
          $t("user.profile.privacy_link")
        }}</router-link>

        <router-link :to="{ name: 'cookie_policy' }">{{
          $t("user.profile.cookie_link")
        }}</router-link>

        <router-link :to="{ name: 'terms_conditions' }">{{
          $t("user.profile.terms_link")
        }}</router-link>
      </div>
    </q-card>

    <q-btn
      color="button-secondary"
      :label="$t('user.auth.signout_title')"
      @click="signOut"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { doSignOut } from "@/helpers/users/auth";
import { useUserStore } from "@/stores/user";

// Init plugin
const $q = useQuasar();
const i18n = useI18n();

// Get user state
const user = useUserStore();

// Get profile picture url
const photoUrl = computed(() => user.photoUrl);

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
