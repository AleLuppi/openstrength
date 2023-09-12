<template>
  <div class="q-pa-md">
    <q-btn :label="$t('user.auth.signout_title')" @click="signOut"></q-btn>
  </div>
</template>

<script setup lang="ts">
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
