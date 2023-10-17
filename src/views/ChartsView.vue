
<template>
  <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
      <h1 class="h2">{{ caption }}</h1>

      <!-- <div class="btn-toolbar mb-2 mb-md-0">
        <div class="btn-group me-2">
          <button type="button" class="btn btn-sm btn-outline-secondary">Share</button>
          <button type="button" class="btn btn-sm btn-outline-secondary">Export</button>
        </div>
        <button type="button" class="btn btn-sm btn-outline-secondary dropdown-toggle">This week</button>
      </div> -->
      <!-- <button class="btn btn-sm btn-outline-secondary" @click="getPosts">Show Posts</button>         -->

      <div class="btn-group me-2">
        <label class="input-group-text btn-sm" for="inputGroupSelect01">for the last</label>
        <select class="btn btn-sm btn-outline-secondary dropdown-toggle" id="inputGroupSelect01" ref="period"
          @change="changePeriod"
          >
          <option value="1h" selected>1 hour</option>
          <option value="24h">24 hours</option>
          <option value="7d">7 days</option>
          <option value="30d">30 days</option>
        </select>
      </div>
  </div>

  <AreaChart ref="chartTP"/>

</template>

<script>
//  import { stringifyExpression } from '@vue/compiler-core';
import AreaChart from '../components/AreaChart.vue'

  export default {
    components: {
      AreaChart
    },
    props: { 
      caption: {
        type: String,
        default: 'TestCaption'
      }
    },
    // provide() {
    //   return {
    //     chartdata: this.chartdata
    //   }
    // },
    // data() {
    //   return {
    //     chartData: {
    //     labels: [ 'January', 'February', 'March' ],
    //     datasets: [ { data: [40, 20, 12] } ]
    //     },
    //     chartOptions: {
    //       responsive: true
    //     }
    //   }
    // },
    methods: {
    changePeriod() {
      console.log("Change Period", this.$refs.period.value);
      this.$refs.chartTP.changePeriod(this.$refs.period.value);
      // console.log("Change Period local", this.selectedPeriod);
      // fetch('/data/chart-' + this.$refs.period.value + '.json')
      // .then(response => {
      //   if (response.ok)
      //   {
      //     response.json()
      //     .then(jsondata => {
      //       console.log("Json Data:", jsondata);
      //       //this.chartdata = jsondata;
      //       //this.$refs.refchart.chartdatax = jsondata;
      //       this.$refs.mychart1.period = this.$refs.period.value;
      //       this.$refs.mychart1.changePeriod(this.$refs.period.value);
      //     })
      //   }
      //   else
      //   {
      //     console.error('Fetch error:', response);
      //   }
      // })
      // .catch(error => {
      //   console.error('Panic at the disco:', error);
      // })
    }
  },
  mounted() {
    this.changePeriod();
  }
  }
</script>
