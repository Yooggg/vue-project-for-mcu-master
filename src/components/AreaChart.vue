<template>
  <h1 class="h3">Indoor air temperature</h1>
  <div class="container">
    <Line
      v-if="loaded"
      :options="chartOptions"
      :data="chartDataT"
    />
</div>
<hr/>
<h1 class="h3">Pressure in the heating system</h1>
<div class="container">
    <Line
      v-if="loaded"
      :options="chartOptions"
      :data="chartDataP"
    />
</div>
<hr/>
</template>

<script>

// Bar
//import { Bar } from 'vue-chartjs'
//import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
//ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

// Line
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js'
ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler)

export default {
  name: 'AreaChart',
  components: { Line },
  data() {
    return {
      loaded: false,
      chartDataT: null,
      chartDataP: null,
      chartOptions: {
        responsive: true
      }
    }
  },
  methods: {
    changePeriod(period) {
      this.loaded = false;
      console.log("Chart change period: " + period);
      
      fetch('/data/chart-' + period + '.json')
      .then(response => {
        if (response.ok)
        {
          response.json()
          .then(jsondata => {

            console.log("Json Data:", jsondata);

            this.chartDataT = {
              labels: jsondata.labels,
              datasets: [
              {
                label: 'Tmax',
                fill: +1,
                backgroundColor: '#88AA8880',
                data: jsondata.t_max,
                tension: 0.3
              },
              {
                label: 'Tmin',
                backgroundColor: '#88AA88',
                data: jsondata.t_min,
                tension: 0.3
              }
            ]
          };

          this.chartDataP = {
              labels: jsondata.labels,
              datasets: [
              {
                label: 'Pmax',
                fill: +1,
                backgroundColor: '#8888AA80',
                data: jsondata.p_max,
                tension: 0.3
              },
              {
                label: 'Pmin',
                backgroundColor: '#8888AA',
                data: jsondata.p_min,
                tension: 0.3
              }
            ]
          };

          this.loaded = true;
          })
        }
        else
        {
          console.error('Fetch error:', response);
        }
      })
      .catch(error => {
        console.error('Panic at the disco:', error);
      })
    }
  }
}
</script>