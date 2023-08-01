<template>
  <div class="home">
    <h2><a href="https://primevue.org/datatable/" target="_blank">Simple Data Table</a>></h2>
    <div class="card">
      <DataTable :value="intensity" showGridlines tableStyle="min-width: 50rem">
          <Column field="week" header="Settimana"></Column>
          <Column field="intensity1" header="<69%"></Column>
          <Column field="intensity2" header="70|75%"></Column>
          <Column field="intensity3" header="76|80%"></Column>
          <Column field="intensity4" header="81|85%"></Column>
          <Column field="intensity5" header="86|90%"></Column>
          <Column field="intensity6" header="91|95%"></Column>
          <Column field="intensity7" header="96|100%"></Column>
          <Column field="total" header="Totale"></Column>
          <Column field="distribution" header="Distribuzione"></Column>
      </DataTable>
  </div>
  </div>

  
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { IntensityService } from '@/test/test_data/IntensityService.js';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';

// Create a reactive variable to hold the data
const intensity = ref(null);

// Fetch the data on component mount
onMounted(async () => {
  try {
    const data = await IntensityService.getIntensityData();
    console.log(data); // Check if the data is fetched successfully
    intensity.value = data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

/* onMounted(() => {
  IntensityService.getIntensityData().then((data) => (intensity.value = data));
}); */

//const products = ref();

</script>
