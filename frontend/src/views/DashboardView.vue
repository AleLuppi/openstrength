<template>
  <div class="row q-pa-md justify-between q-col-gutter-md">
    <!-- TODO dynamic sizing, and auto add title + description -->

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

    <!-- B: andamento Volume x Intensita per ogni seduta-->
      <div class="col-6">
      <chart-component title="B: Andamento Carico di allenamento" description="Andamento dell'intensità x volume nel corso del mesociclo per seduta."
        :data="dataB" :options="optionB" :width="400" :height="300" />
      </div>

    <!-- C: andamento Serie x Intensita Relativa per ogni seduta-->
      <div class="col-6">
      <chart-component title="C: Andamento Carico di allenamento" description="Andamento dell'intensità relativa x volume nel corso del mesociclo per seduta."
        :data="dataC" :options="optionC" :width="400" :height="300" />
      </div>

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

    <!-- E: Example Grid -->
<!--     <div class="col-12">
      <h3>V grid placeholder</h3>
       <v-grid-component />
    </div> -->

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

  <!-- E3: Volume per zone di intensità -->
<!--   <div class="col-6">
      <doughnut-component title="E3: Distribuzione del volume per zone di intensità" type="doughnut"
      description="Questo grafico mostra l'andamento del Volume x Intensità per singolo esercizio"
        :data="dataE3" :width="400" :height="150" />
    </div> -->

  <!-- E4: Zone di intensità per volume -->


    <!-- F: 1RM alzate principali vs peso corporeo -->
    <div class="col-5">
      <chart-component title="1RM alzate principali" description="Andamento dell'1RM versus peso corporeo."
        :data="dataF" :options="optionF" :width="400" :height="300" />
    </div>

    <!-- G: 1RM vs Record mondiali per categoria -->
<!--<div class="col-12">
      <radar-component></radar-component>
    </div> -->



    <div class="col-12">
      <chart-component title="Workout Volume" description="Volume of workouts over time computed as Rep x Set x Load"
        :data="chartData" :options="chartOptions" :width="400" :height="300" />
    </div>
    <div class="col-7">
      <chart-component title="Volume alzate principali" description="Just another graph to test multiple components"
        :data="chartData2" :options="chartOptions2" :width="400" :height="300" />
    </div>

  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import ChartComponent from '@/components/charts/ChartComponent.vue';
import chartData from '@/test/test_data/chartData.json';

import chartData2 from '@/test/test_data/chartData2.json';
import chartOptions2 from '@/test/test_data/chartOptions2.json';
import chartOptions from '@/test/test_data/chartOptions.json';

import { computeVolumeInDateRange } from '@/utils/datamanager/postprocessing.ts';
import dataInput from '@/test/test_data/finalTemplate.json';

// A: dati per andamento Volume, Intensita, IRT per esercizio
import dataA from '@/test/test_data/dataA.json';
import dataA2 from '@/test/test_data/dataA2.json';
import dataA3 from '@/test/test_data/dataA3.json';
import optionA from '@/test/test_data/optionA.json';

// B
import dataB from '@/test/test_data/dataB.json';
import optionB from '@/test/test_data/optionB.json';

// C
import dataC from '@/test/test_data/dataC.json';
import optionC from '@/test/test_data/optionC.json';

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
//import dataE3 from '@/test/test_data/dataE3.json';
//import DoughnutComponent from '@/components/charts/DoughnutChartComponent.vue';

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
