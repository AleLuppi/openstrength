<template>
    <div>
        <q-btn icon="close" flat round dense color="button-negative" @click="store.closeModal"></q-btn>
    </div>
  </template>
  
  <script setup lang="ts">
  import useModalStore from "@/stores/useModalStore";
  
  const store = useModalStore();
  </script>