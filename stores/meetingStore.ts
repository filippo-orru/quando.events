import { defineStore } from 'pinia'

export const useNewMeetingStore = defineStore('newMeetingStore', {
    state: () => ({ name: '' }),
    actions: {
    },
    persist: true
})