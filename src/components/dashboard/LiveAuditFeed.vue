<script setup>
import { Shield, AlertCircle, CheckCircle, Clock } from 'lucide-vue-next'

const logs = [
  { id: 1, action: 'UPLOAD_VERIFY', user: 'arch_lead_01', hash: '0x8f...2a1b', status: 'success', time: '10:42:05' },
  { id: 2, action: 'CONFLICT_DETECT', user: 'bim_coord', hash: '0x3c...9d4e', status: 'warning', time: '10:38:12' },
  { id: 3, action: 'ACCESS_GRANT', user: 'admin_sys', hash: '0xa1...5b2c', status: 'info', time: '10:15:30' },
  { id: 4, action: 'FILE_DELETE', user: 'eng_mep', hash: '0xe4...1f8d', status: 'error', time: '09:55:21' },
  { id: 5, action: 'LOGIN_ATTEMPT', user: 'client_rep', hash: '0x7b...3c9a', status: 'success', time: '09:42:10' },
]

const getStatusIcon = (status) => {
  switch(status) {
    case 'success': return CheckCircle
    case 'warning': return AlertCircle
    case 'error': return Shield
    default: return Clock
  }
}

const getStatusColor = (status) => {
  switch(status) {
    case 'success': return 'text-verum-gold'
    case 'warning': return 'text-orange-400'
    case 'error': return 'text-red-400'
    default: return 'text-blue-400'
  }
}
</script>

<template>
  <div class="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 relative group overflow-hidden rounded-xl border border-verum-slate/50 bg-verum-navy/50 backdrop-blur-sm shadow-glass transition-all duration-300 hover:border-verum-gold/30">
    <!-- Header -->
    <div class="p-4 border-b border-verum-slate/50 flex items-center justify-between bg-black/20">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-verum-gold animate-pulse"></div>
        <h3 class="font-serif text-verum-gold tracking-wide">LIVE AUDIT STREAM</h3>
      </div>
      <div class="flex gap-1">
        <div class="w-2 h-2 rounded-full bg-slate-600"></div>
        <div class="w-2 h-2 rounded-full bg-slate-600"></div>
      </div>
    </div>

    <!-- Terminal Content -->
    <div class="p-4 font-mono text-xs md:text-sm h-[300px] overflow-y-auto space-y-3 custom-scrollbar">
      <div 
        v-for="log in logs" 
        :key="log.id"
        class="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-verum-gold/50"
      >
        <span class="text-slate-500 min-w-[60px]">{{ log.time }}</span>
        
        <component 
          :is="getStatusIcon(log.status)" 
          class="w-4 h-4" 
          :class="getStatusColor(log.status)"
        />
        
        <div class="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 flex-1">
          <span class="text-white font-medium min-w-[120px]">{{ log.action }}</span>
          <span class="text-slate-400">user: <span class="text-verum-gold/80">{{ log.user }}</span></span>
        </div>
        
        <span class="hidden md:inline-block text-slate-600 font-mono text-[10px]">{{ log.hash }}</span>
      </div>
      
      <!-- Typing Cursor Effect -->
      <div class="flex items-center gap-2 mt-4 px-2 opacity-50">
        <span class="text-verum-gold">></span>
        <span class="w-2 h-4 bg-verum-gold animate-blink"></span>
      </div>
    </div>

    <!-- Decor glow -->
    <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-verum-gold/10 blur-[50px] rounded-full pointer-events-none"></div>
  </div>
</template>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(197, 160, 89, 0.2) transparent;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(197, 160, 89, 0.2);
  border-radius: 20px;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.animate-blink {
  animation: blink 1s step-end infinite;
}
</style>
