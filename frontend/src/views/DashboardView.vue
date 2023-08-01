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
    <div class="col-12">
      <h3>V grid placeholder</h3>
       <v-grid-component />
    </div>

  <!--    E2: Example Grid 
    <div class="col-12">
      <h3>Simple Table View</h3>
      <simple-table-component/>
    </div>
 -->


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


    <div class="col-6">
      <chart-component title="Progressi Mesociclo" type="bar"
        description="Questo grafico mostra l'andamento del volume e intensità all'interno di un mesociclo per un esercizio. Es settimana 1, es 1, settimana 2 es 1 ecc ecc."
        :data="barLineChartData" :options="barLineChartOptions" :width="400" :height="150" />
    </div>
    <div class="col-6">
      <chart-component title="Progressi Mesociclo" type="bar"
        description="Questo grafico mostra l'andamento di serie e rep all'interno di un mesociclo per un esercizio."
        :data="barChartData" :options="barChartOptions" :width="400" :height="150" />
    </div>
    <!-- <div class="col-5">
      <chart-component title="Example preprocessing" description="Volume data taken from complete JSON for athlete"
        :data="data" :options="chartOptions" :width="400" :height="300" />
    </div> -->

  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import ChartComponent from '@/components/charts/ChartComponent.vue';
import chartData from '@/test/test_data/chartData.json';

import chartData2 from '@/test/test_data/chartData2.json';
import chartOptions2 from '@/test/test_data/chartOptions2.json';

import barLineChartData from '@/test/test_data/barLineChartData.json';
import barLineChartOptions from '@/test/test_data/barLineChartOptions.json';
import barChartData from '@/test/test_data/barChartData.json';
import barChartOptions from '@/test/test_data/barChartOptions.json';

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
import VGridComponent from '@/components/tables/VGridComponent.vue';



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
