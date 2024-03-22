import { useScriptTag } from '@vueuse/core';
import { defineStore } from 'pinia'
import type { CalendarEntry, ImportedCalendarEntry } from '~/data/Meeting';

type GoogleCalendarStore = {
  token: google.accounts.oauth2.TokenResponse | null;
  isReady: boolean;
}
let googleTokenClient: google.accounts.oauth2.TokenClient | null = null;

export const useGoogleCalendarStore = defineStore('googleToken', {
  state: () => {
    return {
      token: null,
      isReady: false,
    } as GoogleCalendarStore;
  },
  actions: {
    setToken(token: google.accounts.oauth2.TokenResponse) {
      this.token = token;
    },
    setTokenClient(tokenClient: google.accounts.oauth2.TokenClient) {
      googleTokenClient = tokenClient;
    },
    init() {
      useScriptTag('https://apis.google.com/js/api.js', () => {
        gapi.load('client', () => {
          gapi.client.init({
            apiKey: this.googleInfo.apiKey,
            discoveryDocs: this.googleInfo.discoveryDocs,
          }).then(() => {
            console.log('Google API loaded');
          })
        });
      });
      useScriptTag('https://accounts.google.com/gsi/client', () => {
        console.log('Google Sign-In loaded')
        this.setTokenClient(google.accounts.oauth2.initTokenClient({
          client_id: this.googleInfo.clientId,
          scope: this.googleInfo.scope,
          callback: (response) => {
            if (response.error) {
              throw new Error(response.error);
            }
            this.token = response;
            importGoogleCalendarEvents();
          },
        }));
        this.isReady = true;
      });
    },


    importEvents() {
      if (!this.isReady) {
        console.error('Google Sign-In not ready');
        return;
      }

      let client = this.tokenClient!;
      if (this.token) {
        gapi.client.setToken(this.token);
      }

      if (gapi.client.getToken() === null) {
        client.requestAccessToken({ prompt: 'consent' });
      } else {
        importGoogleCalendarEvents();
      }
    },

    remove() {
      this.token = null;
      googleTokenClient = null;
      gapi.client.setToken(null);
      useImportedCalendarEventsStore().clear('google');
    }
  },
  getters: {
    googleInfo: () => {
      let config = useRuntimeConfig();
      return {
        clientId: config.public.googleInfo.clientId,
        apiKey: config.public.googleInfo.apiKey,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar.events.readonly',
      }
    },
    tokenClient: () => googleTokenClient,
    isConnected: (store) => {
      console.log("connected?", store.token)
      return store.token !== null;
    }
  },
  persist: {
    serializer: {
      serialize: (value) => {
        let v = value as GoogleCalendarStore
        return JSON.stringify({
          token: v.token,
        });
      },
      deserialize: (value: string) => {
        const parsed = JSON.parse(value);
        return {
          token: parsed.token,
          tokenClient: null,
          isReady: false,
        } as GoogleCalendarStore;
      }
    }
  },
});


async function importGoogleCalendarEvents() {
  let importedEventsStore = useImportedCalendarEventsStore();

  const request = {
    'calendarId': 'primary',
    'timeMin': (new Date()).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 10,
    'orderBy': 'startTime',
  };
  let response = await gapi.client.request({
    'path': 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    'params': request,
  });

  type GoogleEvent = {
    id: string;
    summary: string;
    start: { dateTime: string; date: string; };
    end: { dateTime: string; date: string; };
  }
  const events = response.result.items as GoogleEvent[] | undefined;
  if (!events || events.length == 0) {
    console.log('No events found.');
    return;
  }
  console.log('Events:', events);

  let calendarEntries = events.map((event) => {
    let start = new Date(event.start.dateTime || event.start.date);
    let end = new Date(event.end.dateTime || event.end.date);
    return {
      id: event.id,
      title: event.summary,
      start: start,
      end: end,
      source: 'google',
    } as ImportedCalendarEntry;
  });
  importedEventsStore.addEvents(calendarEntries);
}