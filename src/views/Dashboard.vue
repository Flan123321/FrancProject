<script setup>
import { Shield } from 'lucide-vue-next'
import VerumSidebar from '../components/layout/VerumSidebar.vue'
import BentoGrid from '../components/dashboard/BentoGrid.vue'
import LiveAuditFeed from '../components/dashboard/LiveAuditFeed.vue'
import ProjectHealthChart from '../components/dashboard/ProjectHealthChart.vue'
import StorageVault from '../components/dashboard/StorageVault.vue'

// Upload action handler
const handleUpload = () => {
    console.log('Initiating Secure Upload...')
}
</script>

<template>
  <div class="flex h-screen w-full bg-verum-navy overflow-hidden font-sans selection:bg-verum-gold/30 selection:text-white">
    <VerumSidebar />
    
    <main class="flex-1 h-full overflow-hidden relative flex flex-col">
      <!-- Background Ambience -->
      <div class="absolute inset-0 bg-gradient-to-br from-verum-navy via-verum-navy to-slate-900 pointer-events-none z-0"></div>
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-verum-gold/5 rounded-full blur-[100px] pointer-events-none"></div>

      <!-- Header -->
      <header class="relative z-10 w-full p-6 flex items-center justify-between border-b border-verum-slate/30 bg-verum-navy/50 backdrop-blur-md">
        <div>
          <h1 class="font-serif text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p class="text-slate-400 text-sm mt-1">System Status: <span class="text-emerald-400 font-mono">ONLINE</span></p>
        </div>

        <button 
          @click="handleUpload"
          class="group relative px-6 py-3 bg-verum-gold/10 hover:bg-verum-gold/20 text-verum-gold border border-verum-gold/50 rounded-lg flex items-center gap-3 transition-all duration-300 shadow-[0_0_20px_rgba(197,160,89,0.1)] hover:shadow-[0_0_30px_rgba(197,160,89,0.3)] overflow-hidden"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <Shield class="w-5 h-5" />
          <span class="font-medium tracking-wide">SECURE UPLOAD</span>
        </button>
      </header>

      <!-- Content Area -->
      <div class="relative z-10 flex-1 overflow-y-auto custom-scrollbar">
        <BentoGrid>
          <!-- Row 1 -->
          <LiveAuditFeed />
          <ProjectHealthChart />
          <StorageVault />
          
          <!-- Row 2 Placeholder (Activity or Map) -->
          <div class="col-span-1 md:col-span-3 lg:col-span-1 min-h-[180px] rounded-xl border-2 border-dashed border-verum-slate/30 flex items-center justify-center group cursor-pointer hover:border-verum-gold/30 transition-colors">
             <div class="text-center">
                <span class="text-slate-500 text-sm group-hover:text-verum-gold transition-colors">+ Add Widget</span>
             </div>
          </div>
        </BentoGrid>
      </div>
    </main>
  </div>
</template>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(30, 41, 59, 0.5) transparent;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(30, 41, 59, 0.5);
  border-radius: 20px;
}
</style>
