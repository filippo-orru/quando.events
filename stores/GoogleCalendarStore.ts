import { useScriptTag } from '@vueuse/core';
import { add } from 'date-fns';
import { defineStore } from 'pinia'
import type { ImportedCalendarEntry } from '~/data/Meeting';

type GoogleCalendar = {
  id: string;
  summary: string;
  selected: boolean;
}

type GoogleCalendarStore = {
  token: google.accounts.oauth2.TokenResponse | null;
  isReady: boolean;
  lastUpdated: Date | null;
  importState: 'idle' | 'loadingCalendars' | 'loadedCalendars' | 'loadingEvents' | 'done';
  calendars: GoogleCalendar[];
}
let googleTokenClient: google.accounts.oauth2.TokenClient | null = null;

export const useGoogleCalendarStore = defineStore('googleToken', {
  state: () => {
    return {
      token: null,
      isReady: false,
      lastUpdated: null,
      importState: 'idle',
      calendars: [],
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
            importGoogleCalendars(this);
          },
        }));
        this.isReady = true;
      });
    },


    startImport() {
      if (!this.isReady) {
        console.error('Google Sign-In not ready');
        return;
      }

      let client = googleTokenClient!;
      if (this.token) {
        gapi.client.setToken(this.token);
      }

      if (gapi.client.getToken() === null) {
        client.requestAccessToken({ prompt: 'consent' });
      } else {
        importGoogleCalendars(this);
      }
    },

    importEvents() {
      if (!this.isReady) {
        console.error('Google Sign-In not ready');
        return;
      }

      if (this.calendars.length === 0) {
        console.error('No calendars selected');
        return;
      }

      importGoogleCalendarEvents(this);
      this.lastUpdated = new Date();
      this.importState = 'done';
    },

    remove() {
      this.importState = 'idle'
      this.calendars = [];
      this.token = null;
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
        scope: 'https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/calendar.readonly',
      }
    },
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
          lastUpdated: v.lastUpdated?.getTime(),
          importState: v.importState,
          calendars: v.calendars,
        });
      },
      deserialize: (value: string) => {
        const parsed = JSON.parse(value);
        return {
          token: parsed.token,
          tokenClient: null,
          isReady: false,
          lastUpdated: parsed.lastUpdated ? new Date(parsed.lastUpdated) : null,
          importState: parsed.importState,
          calendars: parsed.calendars,
        } as GoogleCalendarStore;
      }
    }
  },
});


async function importGoogleCalendars(googleStore: GoogleCalendarStore) {
  let response = await gapi.client.request({
    'path': 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
  });

  type GoogleCalendarResponse = {
    id: string;
    summary: string;
  }

  const calendars = response.result.items as GoogleCalendarResponse[] | undefined;
  if (!calendars || calendars.length == 0) {
    console.log('No calendars found.');
    // TODO error handling
    return;
  }
  console.log('Calendars:', calendars);

  googleStore.calendars = calendars.map((calendar) => {
    return {
      id: calendar.id,
      summary: calendar.summary,
      selected: !calendar.id.endsWith('.calendar.google.com'),
    } as GoogleCalendar;
  });
  googleStore.importState = 'loadedCalendars';
}

async function importGoogleCalendarEvents(googleStore: GoogleCalendarStore) {
  let importedEventsStore = useImportedCalendarEventsStore();

  type GoogleEvent = {
    id: string;
    summary: string;
    start: { dateTime: string; date: string; };
    end: { dateTime: string; date: string; };
  }

  let googleEvents = [] as GoogleEvent[];
  let selectedCalendars = googleStore.calendars.filter((calendar) => calendar.selected);

  for (let calendar of selectedCalendars) {
    const request = {
      'calendarId': calendar.id,
      'timeMin': (add(new Date(), { days: -2 })).toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 50,
      'orderBy': 'startTime',
    };
    let response = await gapi.client.request({
      'path': 'https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(calendar.id) + '/events',
      'params': request,
    });

    const events = response.result.items as GoogleEvent[] | undefined;
    if (!events || events.length == 0) {
      console.log('No events found.');
      continue
    }
    console.log('Events:', events);
    googleEvents.push(...events);
  }

  importedEventsStore.clear('google');

  importedEventsStore.addEvents(
    googleEvents.map((event) => {
      let fullDay = !event.start.dateTime;
      let start = new Date(event.start.dateTime || (event.start.date + " 0:00")); // Set time to 0:00
      let end = new Date(event.end.dateTime || (event.end.date + " 0:00")); // Set time to 0:00
      return {
        id: event.id,
        title: event.summary,
        start: start,
        end: end,
        fullDay: fullDay,
        source: 'google',
      } as ImportedCalendarEntry;
    })
  );
}