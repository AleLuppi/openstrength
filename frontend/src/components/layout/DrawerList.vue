<template>
  <q-list>
    <!-- TODO replace with logged user info -->
    <q-item-label header>Naviga</q-item-label>

    <q-item clickable tag="a" :to="{ name: 'home' }">
      <q-item-section avatar>
        <q-icon name="fa-solid fa-house-chimney" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ $t("layout.drawer.home") }}</q-item-label>
        <q-item-label caption v-if="$t('layout.drawer.home_caption')">{{ $t("layout.drawer.home_caption")
        }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-item clickable tag="a" :to="{ name: 'dashboard' }">
      <q-item-section avatar>
        <q-icon name="timeline" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ $t("layout.drawer.dashboard") }}</q-item-label>
        <q-item-label caption v-if="$t('layout.drawer.dashboard_caption')">{{ $t("layout.drawer.dashboard_caption")
        }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-item clickable tag="a" :to="{ name: 'exercises' }">
      <q-item-section avatar>
        <q-icon name="fa-solid fa-dumbbell" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ $t("layout.drawer.library") }}</q-item-label>
        <q-item-label caption v-if="$t('layout.drawer.library_caption')">{{ $t("layout.drawer.library_caption")
        }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-item clickable tag="a" :to="{ name: 'library' }">
      <q-item-section avatar>
        <q-icon name="fa-solid fa-book" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ $t("layout.drawer.library") }}</q-item-label>
        <q-item-label caption v-if="$t('layout.drawer.library_caption')">{{ $t("layout.drawer.library_caption")
        }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-item clickable tag="a" :to="{ name: 'about' }">
      <q-item-section avatar>
        <q-icon name="fa-solid fa-stream" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ $t("layout.drawer.library") }}</q-item-label>
        <q-item-label caption v-if="$t('layout.drawer.library_caption')">{{ $t("layout.drawer.library_caption")
        }}</q-item-label>
      </q-item-section>
    </q-item>

  </q-list>
</template>

<script setup>
</script>
