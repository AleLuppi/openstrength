<template>
  <div class="q-pa-md">
    <h2>{{ $t("user.profile.profile_title") }}</h2>

    <q-card class="q-mb-lg">
      <h6 class="q-mx-md q-py-md">{{ $t("user.profile.info_title") }}</h6>

      <div class="row justify-between">
        <!-- Profile Image-->
        <q-section class="column align-left q-mx-md">
          <q-icon
            v-if="!photoUrl"
            name="account_circle"
            size="6em"
            class="justify-center card-icon q-ma-sm"
          />
          <q-img
            v-else
            :src="photoUrl"
            size="6em"
            width="96px"
            height="96px"
            class="justify-center q-ma-sm"
            style="border-radius: 50%"
            @error="photoUrl = undefined"
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
        <!-- Status: active or inactive-->
        <q-section class="column align-center q-mx-md">
          <p class="text-h6 text-left">
            {{ $t("user.profile.status") }}
          </p>
          <p class="text-left text-green">to be done</p>
        </q-section>
        <q-section class="column align-center q-mx-md q-mr-xl">
          <p class="text-h6 text-left">
            {{ $t("user.profile.uid") }}
          </p>
          <p class="text-left">{{ user.uid }}</p>
        </q-section>
      </div>

      <q-card-actions class="row justify-end q-mx-xl q-pb-md">
        <q-btn outline color="primary-button">
          {{ $t("user.profile.info_edit") }}</q-btn
        >
      </q-card-actions>
    </q-card>

    <q-btn
      color="secondary-button"
      :label="$t('user.auth.signout_title')"
      @click="signOut"
    />
  </div>
</template>

<script setup lang="ts">
// TODO: pass actual user info
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { doSignOut } from "@/helpers/users/auth";
import { useUserStore } from "@/stores/user";

// Init plugin
const $q = useQuasar();
const i18n = useI18n();

// Get user state
const user = useUserStore();

// Profile picture
const photoUrl = user.photoUrl;

/**
 * Sign out user
 */
function signOut() {
  doSignOut(
    () => {},
    () => {
      $q.notify({
        type: "negative",
        message: i18n.t("user.auth.signout_error"),
        position: "bottom",
      });
    },
  );
}
</script>
