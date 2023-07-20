<template>
  <q-layout view="lHh Lpr lFf">
    <q-header v-if="showHeader" elevated class="glossy">
      <q-toolbar>
        <q-btn flat dense round @click="leftDrawerOpen = !leftDrawerOpen" aria-label="Menu" icon="menu" />

        <q-toolbar-title>
          DBM
        </q-toolbar-title>

        <div>login placeholder</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-2">
      <q-list>
        <q-item-label header>Naviga</q-item-label>
        <q-item clickable tag="a" :to="{ name: 'home' }">
          <q-item-section avatar>
            <q-icon name="school" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Home</q-item-label>
            <q-item-label caption>pagina principale</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" :to="{ name: 'about' }">
          <q-item-section avatar>
            <q-icon name="code" />
          </q-item-section>
          <q-item-section>
            <q-item-label>About</q-item-label>
            <q-item-label caption>scopri di più</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <RouterView />
    </q-page-container>

    <q-footer v-if="showFooter" :elevated="elevatedFooter">
      <!-- TODO -->
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from "vue-router";

// Set ref
const route = useRoute();
const leftDrawerOpen = ref(false);
const showHeader = computed(() => route.meta?.showHeader ?? true);
const showFooter = computed(() => route.meta?.showFooterElevated ?? true);
</script>
