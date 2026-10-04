<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  void router.replace({ name: 'login' })
}
</script>

<template>
  <header class="board-header">
    <span>Kanban</span>
    <button type="button" @click="logout">Déconnexion</button>
  </header>
  <main class="board-content">
    <h1>Board</h1>
  </main>
</template>

<style scoped>
.board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-soft);
}

button {
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  background: var(--color-background);
  font: inherit;
  cursor: pointer;
}

.board-content {
  padding: 24px;
}
</style>
