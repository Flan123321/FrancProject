<script setup>
import { computed } from 'vue'
import { Database } from 'lucide-vue-next'

const series = [76] // 76% used

const chartOptions = computed(() => ({
  chart: {
    type: 'radialBar',
    sparkline: { enabled: true }
  },
  plotOptions: {
    radialBar: {
      startAngle: -90,
      endAngle: 90,
      track: {
        background: "#1e293b", // slate-800
        strokeWidth: '97%',
        margin: 5,
      },
      dataLabels: {
        name: { show: false },
        value: {
          offsetY: -2,
          fontSize: '22px',
          fontWeight: '600',
          color: '#ffffff',
          fontFamily: 'JetBrains Mono',
          formatter: function (val) {
            return val + "%";
          }
        }
      }
    }
  },
  fill: {
    type: 'solid',
    colors: ['#c5a059']
  },
  labels: ['Storage'],
}))
</script>

<template>
  <div class="col-span-1 md:col-span-1 lg:col-span-1 rounded-xl border border-verum-slate/50 bg-verum-navy/50 backdrop-blur-sm shadow-glass p-4 flex flex-col justify-between">
    <div class="flex justify-between items-start">
      <div>
        <h3 class="font-serif text-verum-gold text-lg">Vault</h3>
        <p class="text-xs text-slate-400">Total Storage</p>
      </div>
      <div class="p-2 bg-white/5 rounded-lg text-verum-gold">
        <Database class="w-5 h-5" />
      </div>
    </div>

    <div class="mt-4 flex flex-col items-center">
      <div class="h-[150px] w-full flex items-center justify-center -mt-6">
        <apexchart 
          type="radialBar" 
          height="200"
          :options="chartOptions" 
          :series="series"
        />
      </div>
      <div class="text-center -mt-4">
        <p class="text-xs text-slate-500 font-mono">1.2 TB / 2.0 TB</p>
      </div>
    </div>
  </div>
</template>
