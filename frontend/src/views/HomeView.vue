<template>
  <div class="home">
    <h2><a href="https://primevue.org/datatable/" target="_blank">Simple Data Table</a>></h2>
    <div class="card">
      <DataTable :value="products" tableStyle="min-width: 50rem">
          <Column field="code" header="Code"></Column>
          <Column field="name" header="Name"></Column>
          <Column field="category" header="Category"></Column>
          <Column field="quantity" header="Quantity"></Column>
      </DataTable>
  </div>
  </div>

  
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ProductService } from '@/views/data/ProductService.js';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';

// Create a reactive variable to hold the data
const products = ref(null);

// Fetch the data on component mount
onMounted(async () => {
  try {
    const data = await ProductService.getProductsMini();
    console.log(data); // Check if the data is fetched successfully
    products.value = data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

</script>
