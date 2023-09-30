<template>
  <div class="q-pa-md">
    <h2>{{ $t("user.profile.profile_title") }}</h2>

    <q-card class="q-mb-lg">
      <h6 class="q-mx-md q-py-md">{{ $t("user.profile.card_title") }}</h6>

      <div class="row justify-between">
        <!-- Profile Image-->
        <q-section class="column align-left q-mx-md">
          <q-icon
            name="account_circle"
            size="6em"
            class="justify-center card-icon q-ma-sm"
          />
        </q-section>
        <!-- Name and Surname -->
        <q-section class="column align-center q-mx-md">
          <p class="text-h6 text-left">
            {{ $t("user.profile.cardlabel_name") }}
          </p>
          <p class="text-left">Lorenzo Amatore</p>
        </q-section>
        <!-- Email -->
        <q-section class="column align-center q-mx-md">
          <p class="text-h6 text-left">
            {{ $t("user.profile.cardlabel_mail") }}
          </p>
          <p class="text-left">lorenzmataore@gmail.com</p>
        </q-section>
        <!-- Role: athlete or coach -->
        <q-section class="column align-center q-mx-md">
          <p class="text-h6 text-left">
            {{ $t("user.profile.cardlabel_role") }}
          </p>
          <p class="text-left text-primary">Coach</p>
        </q-section>
        <!-- Status: active or inactive-->
        <q-section class="column align-center q-mx-md">
          <p class="text-h6 text-left">
            {{ $t("user.profile.cardlabel_status") }}
          </p>
          <p class="text-left text-green">Active</p>
        </q-section>
        <q-section class="column align-center q-mx-md q-mr-xl">
          <p class="text-h6 text-left">
            {{ $t("user.profile.cardlabel_coachID") }}
          </p>
          <p class="text-left">HSFSODA904730HHK</p>
        </q-section>
      </div>

      <q-card-actions class="row justify-end q-mx-xl q-pb-md">
        <q-btn> {{ $t("user.profile.cardbutton_edit") }}</q-btn>
      </q-card-actions>
    </q-card>

    <q-btn :label="$t('user.auth.signout_title')" @click="signOut" />
  </div>
</template>

<script setup lang="ts">
// TODO: pass actual user info
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { doSignOut } from "@/helpers/users/auth";

// Init plugin
const $q = useQuasar();
const i18n = useI18n();

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
