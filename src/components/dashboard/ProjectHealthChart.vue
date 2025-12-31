<script setup>
import { ref, computed } from 'vue'

// Dummy data for the chart
const series = [{
  name: 'Resolution Rate',
  data: [30, 40, 35, 50, 49, 60, 70, 91, 125, 100, 140]
}]

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    height: '100%',
    toolbar: { show: false },
    sparkline: { enabled: true },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
    }
  },
  stroke: {
    curve: 'smooth',
    width: 2,
    colors: ['#c5a059'] // Verum Gold
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 100],
      colorStops: [
        { offset: 0, color: '#c5a059', opacity: 0.4 },
        { offset: 100, color: '#c5a059', opacity: 0.0 }
      ]
    }
  },
  tooltip: {
    theme: 'dark',
    x: { show: false },
    y: { title: { formatter: () => 'Resolved:' } }
  },
  grid: {
    padding: { top: 10, right: 0, bottom: 0, left: 10 }
  }
}))
</script>

<template>
  <div class="col-span-1 md:col-span-1 lg:col-span-1 relative h-full min-h-[200px] rounded-xl border border-verum-slate/50 bg-verum-navy/50 backdrop-blur-sm shadow-glass flex flex-col overflow-hidden">
    <div class="p-4 z-10">
      <h3 class="font-serif text-verum-gold text-lg">Project Health</h3>
      <p class="text-xs text-slate-400 mb-1">Conflict Resolution Trend</p>
      <div class="flex items-baseline gap-2">
        <span class="text-2xl font-mono text-white">98.2%</span>
        <span class="text-xs text-emerald-400">+2.4%</span>
      </div>
    </div>

    <div class="flex-1 w-full min-h-[100px] absolute bottom-0">
      <!-- ApexCharts component will be registered globally or locally -->
      <apexchart 
        width="100%" 
        height="100%" 
        type="area" 
        :options="chartOptions" 
        :series="series"
      />
    </div>
  </div>
</template>
