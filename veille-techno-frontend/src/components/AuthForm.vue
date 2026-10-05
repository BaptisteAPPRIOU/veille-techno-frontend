<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ApiError } from '@/api/http'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{ register?: boolean }>()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const errors = ref({ name: '', email: '', password: '' })
const errorMessage = ref(
  !props.register && route.query.reason === 'expired' ? 'Session expirée' : '',
)

async function submit() {
  if (loading.value) return

  errors.value = { name: '', email: '', password: '' }
  errorMessage.value = ''

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    errors.value.email = 'Saisis une adresse email valide.'
  }
  if (password.value.length < 6) {
    errors.value.password = 'Le mot de passe doit contenir au moins 6 caractères.'
  }
  if (props.register && (name.value.trim().length === 0 || name.value.trim().length > 32)) {
    errors.value.name = 'Le nom doit contenir entre 1 et 32 caractères.'
  }
  if (errors.value.name || errors.value.email || errors.value.password) return

  loading.value = true
  try {
    const input = { email: email.value.trim(), password: password.value }
    if (props.register) {
      await auth.register({ ...input, name: name.value.trim() })
    } else {
      await auth.login(input)
    }
    await router.replace({ name: 'board' })
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        errorMessage.value = 'Email ou mot de passe incorrect'
      } else if (error.status === 409) {
        errors.value.email = 'Cette adresse email est déjà utilisée.'
      } else if (error.status === 400) {
        // NestJS renvoie un tableau : chaque message rejoint son champ.
        for (const field of ['name', 'email', 'password'] as const) {
          errors.value[field] = error.messages
            .filter((message) => message.startsWith(field + ' '))
            .join(' ')
        }
        errorMessage.value = error.messages
          .filter((message) => !/^(name|email|password) /.test(message))
          .join(' ')
      } else {
        errorMessage.value = error.message
      }
    } else {
      errorMessage.value = 'Une erreur est survenue. Réessaie.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <div class="auth-logo" aria-hidden="true">K</div>
    <h1>{{ props.register ? 'Créer un compte' : 'Se connecter au Kanban' }}</h1>

    <p v-if="errorMessage" class="auth-alert" role="alert">{{ errorMessage }}</p>

    <form class="auth-form" novalidate :aria-busy="loading" @submit.prevent="submit">
      <fieldset :disabled="loading">
        <div v-if="props.register" class="form-field">
          <label for="name">Nom</label>
          <input
            id="name"
            v-model="name"
            type="text"
            autocomplete="name"
            required
            :aria-invalid="!!errors.name"
            :aria-describedby="errors.name ? 'name-error' : undefined"
          />
          <p v-if="errors.name" id="name-error" class="field-error" role="alert">
            {{ errors.name }}
          </p>
        </div>

        <div class="form-field">
          <label for="email">Adresse email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            :aria-invalid="!!errors.email"
            :aria-describedby="errors.email ? 'email-error' : undefined"
          />
          <p v-if="errors.email" id="email-error" class="field-error" role="alert">
            {{ errors.email }}
          </p>
        </div>

        <div class="form-field">
          <label for="password">Mot de passe</label>
          <input
            id="password"
            v-model="password"
            type="password"
            :autocomplete="props.register ? 'new-password' : 'current-password'"
            required
            minlength="6"
            :aria-invalid="!!errors.password"
            :aria-describedby="errors.password ? 'password-error' : undefined"
          />
          <p v-if="errors.password" id="password-error" class="field-error" role="alert">
            {{ errors.password }}
          </p>
        </div>

        <button type="submit">
          {{ loading ? 'En cours…' : props.register ? 'Créer mon compte' : 'Se connecter' }}
        </button>
      </fieldset>
    </form>

    <p class="auth-switch">
      {{ props.register ? 'Déjà un compte ?' : 'Nouveau sur le Kanban ?' }}
      <RouterLink :to="props.register ? '/login' : '/register'">
        {{ props.register ? 'Se connecter' : 'Créer un compte' }}
      </RouterLink>
    </p>
  </main>
</template>

<style scoped>
.auth-page {
  max-width: 360px;
  margin: 48px auto;
  padding: 0 16px;
}

.auth-logo {
  width: 48px;
  height: 48px;
  margin: 0 auto 20px;
  border-radius: 50%;
  background: var(--color-heading);
  color: var(--color-background);
  font-size: 28px;
  font-weight: 600;
  text-align: center;
}

h1 {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 400;
  text-align: center;
}

.auth-form,
.auth-switch,
.auth-alert {
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.auth-form {
  background: var(--color-background-soft);
}

fieldset {
  padding: 0;
  border: 0;
  min-width: 0;
}

.form-field {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

input,
button {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font: inherit;
}

input {
  color: var(--color-text);
  background: var(--color-background);
}

input:focus-visible,
button:focus-visible,
a:focus-visible {
  outline: 2px solid #0969da;
  outline-offset: 2px;
}

button {
  background: #1f883d;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

button:hover {
  background: #1a7f37;
}

fieldset:disabled {
  opacity: 0.7;
}

fieldset:disabled button {
  cursor: wait;
}

.auth-switch {
  margin-top: 16px;
  text-align: center;
}

a {
  color: #0969da;
}

.field-error {
  margin-top: 6px;
  color: #cf222e;
  font-size: 13px;
}

.auth-alert {
  margin-bottom: 16px;
  border-color: #cf222e;
}

@media (prefers-color-scheme: dark) {
  a {
    color: #58a6ff;
  }

  .field-error {
    color: #ff7b72;
  }
}
</style>
