<template>
  <q-header bordered class="bg-lightest text-light">
    <q-toolbar>
      <!-- Left drawer button -->
      <q-btn
        v-if="allowLeftDrawer"
        flat
        dense
        round
        aria-label="Menu"
        icon="menu"
        @click="$emit('openLeft')"
      />

      <!-- Clickable logo -->
      <q-btn
        flat
        dense
        aria-label="To home"
        :to="{
          name: isUserSignedIn ? NamedRoutes.home : NamedRoutes.landing,
        }"
      >
        <img :src="logoTextOnly" alt="Logo OpenStrength" style="height: 20px" />
      </q-btn>

      <q-space />

      <!-- Action buttons -->
      <q-btn
        icon-right="person"
        :label="
          $q.screen.lt.md
            ? undefined
            : isUserSignedIn
            ? $t('layout.header.to_profile')
            : $t('layout.header.to_login')
        "
        :to="{ name: NamedRoutes.profile }"
        color="primary"
      />

      <!-- Right drawer button -->
      <q-btn
        v-if="allowRightDrawer"
        flat
        dense
        round
        aria-label="Menu"
        icon="menu"
        @click="$emit('openRight')"
      />
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { NamedRoutes } from "@/router";
import type { QHeaderProps } from "quasar";
import { logoTextOnly } from "@/assets/sources";

// Define props
defineProps<
  QHeaderProps & {
    // whether to display stuff for logged or external users
    isUserSignedIn?: boolean;

    // whether to show open/close buttons for left and right drawers
    allowLeftDrawer?: boolean;
    allowRightDrawer?: boolean;
  }
>();

// Define emits
defineEmits<{
  openLeft: [];
  openRight: [];
}>();
</script>
