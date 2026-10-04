import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { setAuthToken, setUnauthorizedHandler } from './api/http'

const app = createApp(App)

app.use(createPinia())

const auth = useAuthStore()
// Restaure aussi le token du client HTTP avant le premier appel à l'API.
setAuthToken(auth.token)
setUnauthorizedHandler(() => {
  auth.logout()
  void router.replace({ name: 'login', query: { reason: 'expired' } })
})

app.use(router)

app.mount('#app')
