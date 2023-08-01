<template>
  <div class="home">
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

<script>
import { ref, onMounted } from 'vue';
import { ProductService } from '@/views/data/ProductService.js';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';

export default {
  components: {
    Column,
    DataTable,
  },
  setup() {
    const products = ref(null);

    onMounted(async () => {
      const data = await ProductService.getProductsMini();
      console.log(data); // Check if the data is fetched successfully
      products.value = data;
    });

    return {
      products,
    };
  },
};
</script>
