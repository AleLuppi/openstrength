<template>
    <Toolbar class="mb-4">
              <template #start>
                  <Dropdown v-model="selectedCountry" :options="countries" showClear filter optionLabel="name" :virtualScrollerOptions="{ itemSize: 38 }" placeholder="Seleziona allievo" class="w-full md:w-14rem">
                      <template #value="slotProps">
                          <div v-if="slotProps.value" class="flex align-items-center">
                              <img :alt="slotProps.value.label" src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png" :class="`mr-2 flag flag-${slotProps.value.code.toLowerCase()}`" style="width: 18px" />
                              <div>{{ slotProps.value.name }}</div>
                          </div>
                          <span v-else>
                              {{ slotProps.placeholder }}
                          </span>
                      </template>
                      <template #option="slotProps">
                          <div class="flex align-items-center">
                              <img :alt="slotProps.option.label" src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png" :class="`mr-2 flag flag-${slotProps.option.code.toLowerCase()}`" style="width: 18px" />
                              <div>{{ slotProps.option.name }}</div>
                          </div>
                      </template>
                  </Dropdown>
                  
              </template>

              <template #end>
                <Calendar v-model="dates" selectionMode="range" :manualInput="false" placeholder="Seleziona date" showIcon showButtonBar />
                <Button label="Update grafici" icon="pi pi-plus" severity="success" class="mr-2" @click="updateDashboard" />
              </template>
   </Toolbar>
             
    <!-- TODO dynamic sizing, and auto add title + description -->

  <div class="row q-pa-md justify-between q-col-gutter-md">
    <div class="col-12">
      <h6 class="text-h6">Volume, Intensità e IRT</h6>
    <TabView>
      <TabPanel header="Per esercizio">
        <div class="chart-container">
          <!-- A4: andamento Volume per tutti gli esercizi -->
          <div class="col-4">
            <chart-component title="Volume" description="Andamento del volume per le diverse alzate principali."
              :data="dataA4" :options="optionA4" :width="400" :height="300" />
          </div>
          <div class="col-4">
            <chart-component title="Intensità" description="Andamento dell'intensità per le diverse alzate principali."
              :data="dataA5" :options="optionA5" :width="400" :height="300" />
          </div>
          <div class="col-4">
            <chart-component title="IRT" description="Andamento dell'IRT per le diverse alzate principali."
              :data="dataA6" :options="optionA6" :width="400" :height="300" />
          </div>
      </div>
      </TabPanel>

      <TabPanel header="Totali">
        <div class="chart-container">
        <!-- A: andamento Volume, Intensita, IRT per esercizio -->
        <div class="col-4">
          <chart-component title="A: Panca - Andamento parametri nel mesociclo" description="Andamento dell'intensità, volume e IRT nel mesociclo di riferimento."
            :data="dataA" :options="optionA" :width="400" :height="300" />
        </div>
        <div class="col-4">
          <chart-component title="A2: Stacco - Andamento parametri nel mesociclo" description="Andamento dell'intensità, volume e IRT nel mesociclo di riferimento."
            :data="dataA2" :options="optionA" :width="400" :height="300" />
        </div>
        <div class="col-4">
          <chart-component title="A3: Squat - Andamento parametri nel mesociclo" description="Andamento dell'intensità, volume e IRT nel mesociclo di riferimento."
            :data="dataA3" :options="optionA" :width="400" :height="300" />
        </div>
      </div>
      </TabPanel>    

    </TabView>
</div>


<div class="col-12">
  <h6 class="text-h6">Carico di Allenamento</h6>
    <TabView>
      <TabPanel header="Per esercizio">
        <div class="chart-container">
          <!-- D: Andamento del Volume x Intensità nelle settimane per i singoli esercizi -->
          <div class="col-6">
            <chart-component title="D: Andamento Carico di allenamento per esercizio" type="bar"
              description="Questo grafico mostra l'andamento del Volume x Intensità per singolo esercizio"
              :data="dataD" :options="optionD" :width="400" :height="150" />
          </div>

          <!-- D2: Uguale al precedente ma sottoforma di line graph -->
          <div class="col-6">
            <chart-component title="D2: Andamento Carico di allenamento per esercizio" type="bar"
              description="Questo grafico mostra l'andamento del Volume x Intensità per singolo esercizio"
              :data="dataD2" :options="optionD2" :width="400" :height="150" />
          </div>
      </div>
      </TabPanel>

      <TabPanel header="Per seduta">
        <div class="chart-container">
          <!-- B: andamento Volume x Intensita per ogni seduta-->
          <div class="col-6">
            <chart-component title="B: Carico di allenamento (bar)" description="Andamento dell'intensità x volume nel corso del mesociclo per seduta."
            :data="dataB" :options="optionB" :width="400" :height="300" />
          </div>

           <!-- C: andamento Serie x Intensita Relativa per ogni seduta-->
          <div class="col-6">
            <chart-component title="C: Carico di allenamento (line)" description="Andamento dell'intensità relativa x volume nel corso del mesociclo per seduta."
            :data="dataC" :options="optionC" :width="400" :height="300" />
          </div>
      </div>
      </TabPanel>

      <TabPanel header="Per settimana">
        <div class="chart-container">
          <!-- B: andamento Volume x Intensita per ogni seduta-->
          <div class="col-6">
            <chart-component title="B: Andamento Carico di allenamento" description="Andamento dell'intensità x volume nel corso del mesociclo per seduta."
            :data="dataB2" :options="optionB2" :width="400" :height="300" />
          </div>

           <!-- C: andamento Serie x Intensita Relativa per ogni seduta-->
          <div class="col-6">
            <chart-component title="C: Andamento Carico di allenamento" description="Andamento dell'intensità relativa x volume nel corso del mesociclo per seduta."
            :data="dataC2" :options="optionC2" :width="400" :height="300" />
          </div>
      </div>
      </TabPanel>

    </TabView>
</div>




<div class="col-12">
      <h6 class="text-h6">Distribuzione Volume e Intensità</h6>
        <TabView>
          <TabPanel header="Distribuzioni">
              <!-- E2: Andamento del volume a seconda dei livelli di intensità  -->
            <div class="col-12">
              <div class="chart-container">
                 <!-- F: 1RM alzate principali vs peso corporeo -->
                <div class="col-6">
                  <chart-component title="1RM alzate principali" description="Andamento dell'1RM versus peso corporeo."
                    :data="dataF" :options="optionF" :width="400" :height="300" />
                </div>
                <!-- E3: Volume per zone di intensità -->
                <!-- E3: TO DO: adjust color styling in component or create another component -->
                <div class="col-3">
                  <chart-component title="Volume per diversi livelli di intensità" 
                  description="Volume di allenamento per vari livelli di intensità relativa durante le settimane." type="doughnut"
                    :data="dataE3" :options="optionsE3" :width="400" :height="300" />
                </div>

                <!-- E4: Volume per settimane -->
                <!-- E4: TO DO: adjust color styling in component or create another component -->
                    <div class="col-3">
                  <chart-component title="Volume nelle settimane" 
                  description="Volume di allenamento per durante le settimane." type="doughnut"
                    :data="dataE4" :options="optionsE4" :width="400" :height="300" />
                </div>


              </div>
            </div>

          </TabPanel>

          
          <TabPanel header="Dati">
              <!-- E2: Andamento del volume a seconda dei livelli di intensità  -->
        <div class="col-12">
            <q-card class="shadow-3">
            <q-card-section class="q-mb-md">
              <div class="row items-center no-wrap">
                <div class="col text-h5 text-weight-medium text-grey">
                  {{ "Volume per diversi livelli di intensità" }}
                </div>

                <div class="col-auto">
                  <q-icon name="fas fa-circle-info" size="1.7rem" color="grey-5">
                    <q-tooltip anchor="center left" self="center right" transition-show="fade" transition-hide="fade"
                      class="bg-primary text-body2">
                      {{ "Volume di allenamento per vari livelli di intensità relativa durante le settimane." }}
                    </q-tooltip>
                  </q-icon>
                </div>
              </div>
            </q-card-section>

            <q-separator spaced="lg" size="2px" />

            <q-card-section>
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
            </q-card-section>
          </q-card>
        </div>

          </TabPanel>


        </TabView>
    </div>




    <!-- G: 1RM vs Record mondiali per categoria -->
    <!--<div class="col-12">
      <radar-component></radar-component>
    </div> -->



  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Chart from 'chart.js/auto';
import ChartComponent from '@/components/charts/ChartComponent.vue';


import { computeVolumeInDateRange } from '@/utils/datamanager/postprocessing.ts';
import dataInput from '@/test/test_data/finalTemplate.json';

// Athlete Selection: 
const selectedCountry = ref();
const countries = ref([
    { name: 'Marco Rossi', code: 'AU' },
    { name: 'Giovanni Bianchi', code: 'BR' },
    { name: 'Luigi Verdi', code: 'CN' },
    { name: 'Lorenzo Culurgioni', code: 'EG' },
    { name: 'Francesco Ramadin', code: 'FR' },
    { name: 'Alessandro Lupo', code: 'DE' },
    { name: 'Lorenzo Amatore', code: 'IN' }
]);

// Date range selection: 
const dates = ref();

// A: dati per andamento Volume, Intensita, IRT per esercizio
import dataA from '@/test/test_data/dataA.json';
import optionA from '@/test/test_data/optionA.json';

import dataA2 from '@/test/test_data/dataA2.json';
import dataA3 from '@/test/test_data/dataA3.json';

import dataA4 from '@/test/test_data/dataA4.json';
import optionA4 from '@/test/test_data/optionA4.json';
import dataA5 from '@/test/test_data/dataA5.json';
import optionA5 from '@/test/test_data/optionA5.json';
import dataA6 from '@/test/test_data/dataA6.json';
import optionA6 from '@/test/test_data/optionA6.json';

// B
import dataB from '@/test/test_data/dataB.json';
import optionB from '@/test/test_data/optionB.json';
import dataB2 from '@/test/test_data/dataB2.json';
import optionB2 from '@/test/test_data/optionB2.json';

// C
import dataC from '@/test/test_data/dataC.json';
import optionC from '@/test/test_data/optionC.json';
import dataC2 from '@/test/test_data/dataC2.json';
import optionC2 from '@/test/test_data/optionC2.json';

// D
import dataD from '@/test/test_data/dataD.json';
import optionD from '@/test/test_data/optionD.json';
import dataD2 from '@/test/test_data/dataD2.json';
import optionD2 from '@/test/test_data/optionD2.json';

// E
//import VGridComponent from '@/components/tables/VGridComponent.vue';

// E2
import { ref } from 'vue';
import { IntensityService } from '@/test/test_data/IntensityService.js';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';

const intensity = ref(null);

onMounted(async () => {
  try {
    const data = await IntensityService.getIntensityData();
    intensity.value = data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

// E3
const doughnutChartE3 = ref(null);

const dataE3 = {
  labels: ['<69%', '70|75%', '76|80%', '81|85%', '86|90%', '91|95%', '96|100%'],
  datasets: [
    {
      data: [40, 227, 88, 28, 0 ,3, 0],
      backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
      hoverOffset: 4,
    },
  ],
};

const optionsE3 = {
  type: 'doughnut',
  data: dataE3,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    // Customize chart options here
  },
};

const renderChartE3 = () => {
  if (!doughnutChartE3.value || !(doughnutChartE3.value instanceof HTMLCanvasElement)) {
    console.error('Missing or invalid reference to canvas element.');
    return;
  }

  const ctx = doughnutChartE3.value.getContext('2d');
  new Chart(ctx, optionsE3);
};

onMounted(renderChartE3);

//E4
const doughnutChartE4 = ref(null);

const dataE4 = {
  labels: ['Settimana 1', 'Settimana 2', 'Settimana 3', 'Settimana 4'],
  datasets: [
    {
      data: [87, 101, 133, 65],
      backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
      hoverOffset: 4,
    },
  ],
};

const optionsE4 = {
  type: 'doughnut',
  data: dataE4,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    // Customize chart options here
  },
};

const renderChartE4 = () => {
  if (!doughnutChartE4.value || !(doughnutChartE4.value instanceof HTMLCanvasElement)) {
    console.error('Missing or invalid reference to canvas element.');
    return;
  }

  const ctx = doughnutChartE4.value.getContext('2d');
  new Chart(ctx, optionsE4);
};

onMounted(renderChartE4);
// F
import dataF from '@/test/test_data/dataF.json';
import optionF from '@/test/test_data/optionF.json';

//G 
//import RadarComponent from '@/components/charts/RadarComponent.vue';

onMounted(async () => {
  dataInput.registeredFitness.forEach((el) => el.date = new Date(el.date));
  console.log(computeVolumeInDateRange(dataInput.registeredFitness, new Date('2023-07-25'), new Date('2023-07-28')));
});
</script>

<style>
  .chart-container {
    display: flex;
    justify-content: space-between;
  }

  .text-h6{
    margin: 0px;
  }
</style>