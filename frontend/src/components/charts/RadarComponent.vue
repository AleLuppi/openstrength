<template>
    <div>
      <div>
        <label for="gender">Select Gender:</label>
        <select v-model="selectedGender" id="gender" @change="handleGenderChange">
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>
  
      <div>
        <label for="category">Select Category:</label>
        <select v-model="selectedCategory" id="category" @change="handleCategoryChange">
          <option v-for="category in categories" :value="category" :key="category">{{ category }}</option>
        </select>
      </div>
  
      <canvas ref="radarChart" width="400" height="400"></canvas>
    </div>
  </template>
  
  <script>
  import Chart from 'chart.js';
  
  export default {
    data() {
      return {
        selectedGender: 'male',
        selectedCategory: '-59kg',
        categories: [],
        radarData: {},
      };
    },
    mounted() {
      this.categories = this.getCategories(this.selectedGender);
      this.updateRadarChart();
    },
    methods: {
      getCategories(gender) {
        return gender === 'male'
          ? ['-59kg', '-66kg', '-74kg', '-83kg', '-93kg', '-105kg', '-120kg', '120+kg']
          : ['-47kg', '-52kg', '-57kg', '-63kg', '-69kg', '-76kg', '-84kg', '84+kg'];
      },
      getCategoryData(category) {
        // Replace this with your data retrieval logic for each category
        // You should have a mapping between the category and its associated data.
        // For example, you can use an object with category as key and an object with the four values as its value.
        return {
          '-59kg': { squat: 100, bench: 90, deadlift: 110, total: 300 },
          '-66kg': { squat: 110, bench: 92, deadlift: 130, total: 400 },
          '-74kg': { squat: 120, bench: 94, deadlift: 140, total: 500 },
          '-83kg': { squat: 130, bench: 96, deadlift: 150, total: 600 },
          '-93kg': { squat: 140, bench: 98, deadlift: 160, total: 700 },
          '-105kg': { squat: 150, bench: 99, deadlift: 170, total: 800 },
          '-120kg': { squat: 160, bench: 99, deadlift: 180, total: 900 },
          '-120+kg': { squat: 170, bench: 99, deadlift: 190, total: 1000 },
        }[category];
      },
      handleGenderChange() {
        this.categories = this.getCategories(this.selectedGender);
        this.selectedCategory = this.categories[0];
        this.updateRadarChart();
      },
      handleCategoryChange() {
        this.updateRadarChart();
      },
      updateRadarChart() {
        const categoryData = this.getCategoryData(this.selectedCategory);

        this.radarData = {
          labels: Object.keys(categoryData),
          datasets: [
            {
              label: this.selectedCategory,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              data: Object.values(categoryData),
            },
          ],
        };

        if (this.chart) {
          this.chart.destroy();
        }

        // Use the Chart object directly to create the radar chart
        this.chart = new Chart(this.$refs.radarChart, {
          type: 'radar',
          data: this.radarData,
          options: {
            // Add any additional options for your radar chart here if needed
            // Example: responsive: true
          },
        });
      },

    },
  };
  </script>
  