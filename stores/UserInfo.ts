import { useDebounceFn } from '@vueuse/core';
import { defineStore } from 'pinia'
import type { AccessToken } from '~/server/utils/db/users';

export const useUserInfoStore = defineStore({
  id: 'userInfoStore',
  state: () => ({
    id: null as string | null,
    token: null as AccessToken | null,
    name: null as string | null,
    email: null as string | null,
  }),

  actions: {
    async init() {
      if (!this.id || !this.token) {
        try {
          let user = await $fetch('/api/auth/register', {
            method: 'POST',
          });
          this.id = user.id;
          this.token = user.token;
        } catch (e) {
          console.error(e);
        }
      }
    },
    setName(name: string) {
      this.name = name;
      updateUser();
    },
    setEmail(email: string) {
      this.email = email;
      updateUser();
    },
  },

  persist: true,
})

// debounced
const updateUser = useDebounceFn(async () => {
  let store = useUserInfoStore();

  if (!store.token) {
    console.error('No token');
    return;
  }

  let response = await $fetch('/api/users/me', {
    method: 'PATCH',
    headers: {
      "Authorization": `${store.id}##${store.token.token}`,
    },
    body: JSON.stringify({
      name: store.name,
      email: store.email,
    }),
  });

  if (response == 'unauthorized') {
    console.error('Unauthorized');
    store.token = null;
    store.id = null;
    store.init();
  } else {
    store.id = response.id;
    store.name = response.name;
    store.email = response.email;
  }
}, 1000);
