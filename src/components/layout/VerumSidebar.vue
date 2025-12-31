<script setup>
import { ref } from 'vue'
import { Home, Folder, Shield, Settings, Menu, ChevronLeft } from 'lucide-vue-next'

const isCollapsed = ref(false)

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Folder, label: 'Projects', path: '/projects' },
  { icon: Shield, label: 'Audit Logs', path: '/audit' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <aside 
    class="relative h-screen flex flex-col border-r border-verum-slate/50 bg-verum-navy/80 backdrop-blur-xl transition-all duration-300 ease-in-out z-50 shadow-glass"
    :class="[isCollapsed ? 'w-20' : 'w-64', 'fixed md:relative bottom-0 w-full md:h-screen']"
  >
    <!-- Logo Area -->
    <div class="h-16 flex items-center justify-between px-6 border-b border-verum-slate/50">
      <div v-if="!isCollapsed" class="flex items-center gap-2 text-verum-gold font-serif text-xl tracking-wider font-bold animate-fade-in">
        VERUM
      </div>
      <div v-else class="w-full flex justify-center text-verum-gold font-serif font-bold text-xl">
        V
      </div>
      
      <!-- Collapse Toggle (Desktop only) -->
      <button 
        @click="toggleCollapse"
        class="hidden md:flex p-1 rounded-md hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeft v-if="!isCollapsed" class="w-5 h-5" />
        <Menu v-else class="w-5 h-5" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 py-6 px-3 space-y-2">
      <router-link
        v-for="item in navItems" 
        :key="item.path" 
        :to="item.path"
        class="flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden"
        :class="[
          $route.path === item.path 
            ? 'bg-verum-gold/10 text-verum-gold border border-verum-gold/20 shadow-glow' 
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        ]"
      >
        <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
        
        <span 
          v-if="!isCollapsed" 
          class="font-sans text-sm font-medium whitespace-nowrap"
        >
          {{ item.label }}
        </span>

        <!-- Tooltip for collapsed state -->
        <div 
          v-if="isCollapsed"
          class="absolute left-full ml-4 px-2 py-1 bg-verum-slate border border-slate-700 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
        >
          {{ item.label }}
        </div>
      </router-link>
    </nav>

    <!-- User Profile / Footer (Optional) -->
    <div class="p-4 border-t border-verum-slate/50">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-verum-gold/20 flex items-center justify-center text-verum-gold font-bold text-xs ring-1 ring-verum-gold/50">
          AD
        </div>
        <div v-if="!isCollapsed" class="flex flex-col">
          <span class="text-xs font-medium text-white">Admin User</span>
          <span class="text-[10px] text-slate-500">View Profile</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
