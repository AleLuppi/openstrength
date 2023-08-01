<template>
  <div class="home">
    <div class="card">
      <!-- Render the DataTable only when items is not empty -->
      <DataTable v-if="items.length" :value="data" tableStyle="min-width: 50rem">
        <Column field="code" header="Code"></Column>
        <Column field="name" header="Name"></Column>
        <Column field="category" header="Category"></Column>
        <Column field="quantity" header="Quantity"></Column>
      </DataTable>
      <!-- Show a message when items is empty -->
      <div v-else>No data to display</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Column, DataTable } from 'primevue/datatable';

// Define the hardcoded data
const data = ref([
  { code: '001', name: 'Product A', category: 'Category A', quantity: 10 },
  { code: '002', name: 'Product B', category: 'Category B', quantity: 15 },
  { code: '003', name: 'Product C', category: 'Category A', quantity: 8 },
  { code: '004', name: 'Product D', category: 'Category C', quantity: 20 },
  { code: '005', name: 'Product E', category: 'Category B', quantity: 12 },
]);
</script>
