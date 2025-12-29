<script setup>
import { ref } from 'vue'
import { supabase } from '../supabaseClient'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const email = ref('')
const password = ref('')
const isSignUp = ref(false)
const message = ref('')

const handleAuth = async () => {
  loading.value = true
  message.value = ''
  
  // Limpieza agresiva: eliminar espacios y caracteres invisibles
  let cleanEmail = email.value.trim().replace(/\s/g, '')
  
  // Verificación visual para depuración
  console.log('Email original:', email.value)
  console.log('Email limpio:', cleanEmail)
  console.log('Caracteres:', cleanEmail.split('').map(c => c.charCodeAt(0)))

  try {
    const { error } = isSignUp.value 
      ? await supabase.auth.signUp({ 
          email: cleanEmail, 
          password: password.value,
          options: { data: { full_name: cleanEmail.split('@')[0] } } 
        })
      : await supabase.auth.signInWithPassword({ 
          email: cleanEmail, 
          password: password.value 
        })

    if (error) throw error
    
    if (isSignUp.value) {
        message.value = 'Registro exitoso! Por favor inicia sesión.'
        isSignUp.value = false
    } else {
        router.push('/dashboard')
    }
  } catch (error) {
    message.value = error.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
      <div>
        <h2 class="text-center text-3xl font-extrabold text-gray-900">
          {{ isSignUp ? 'Crear cuenta' : 'Iniciar Sesión' }}
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleAuth">
        <div class="-space-y-px rounded-md shadow-sm">
          <div>
            <label for="email-address" class="sr-only">Email</label>
            <input id="email-address" v-model.trim="email" name="email" type="email" autocomplete="email" required class="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="Email address" />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input id="password" v-model="password" name="password" type="password" autocomplete="current-password" required class="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="Password" />
          </div>
        </div>

        <div v-if="message" class="text-sm text-center" :class="message.includes('exitoso') ? 'text-green-600' : 'text-red-600'">
            {{ message }}
        </div>

        <div>
          <button type="submit" :disabled="loading" class="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            {{ loading ? 'Procesando...' : (isSignUp ? 'Registrarse' : 'Entrar') }}
          </button>
        </div>
      </form>
      <div class="text-center">
        <button @click="isSignUp = !isSignUp" class="text-sm text-indigo-600 hover:text-indigo-500">
          {{ isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate' }}
        </button>
      </div>
    </div>
  </div>
</template>
