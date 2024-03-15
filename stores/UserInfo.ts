import { useDebounceFn } from '@vueuse/core';
import { defineStore } from 'pinia'
import type { AccessToken } from '~/server/utils/db/users';
import { ApiClient } from '~/utils/ApiClient';

type userInfoStore = {
  id: string | null;
  name: string | null;
  email: string | null;
}

export const useUserInfoStore = defineStore('userInfoStore', {
  state: () => ({
    id: null as string | null,
    name: null as string | null,
    email: null as string | null,
  }),

  actions: {
    async init() {

    },
    setName(name: string) {
      this.name = name;
      updateUser(this);
    },
    setEmail(email: string) {
      this.email = email;
      updateUser(this);
    },
  },

  persist: true,
})

// debounced
const updateUser = useDebounceFn(async (store: userInfoStore) => {
  let response = await ApiClient.i.updateUser({
    name: store.name,
    email: store.email,
  });

  if (response) {
    store.id = response.id;
    store.name = response.name;
    store.email = response.email;
  }
}, 1000);
