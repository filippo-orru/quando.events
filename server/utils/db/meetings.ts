import { CalendarTimeslot } from "~/data/Meeting";
import { randomIdChars } from "./db_utils";
import { UpdateMeeting } from "~/server/api/meetings/[...meetingId]/index.patch";

// MARK: Types
export type Meeting = {
    id: string;
    title: string;
    times: { [key: string]: CalendarTimeslot[] };
};

const meetingStorage = useStorage<Meeting>('redis:meetings');

// 34^8 = 1.785.793.904.896 possible combinations
const meetingIdLength = [4, 4]; // 2 groups of 4 characters, separated by a dash
function generateMeetingId() {
    let id = [];
    for (let i = 0; i < meetingIdLength.length; i++) {
        let part = '';
        for (let j = 0; j < meetingIdLength[i]; j++) {
            part += randomIdChars[Math.floor(Math.random() * randomIdChars.length)];
        }
        id.push(part);
    }
    return id.join('-');
}

export async function createMeeting() {
    // Create a new meeting in the database
    let meeting = {
        id: generateMeetingId(),
        title: '',
        times: {},
    } as Meeting;
    await meetingStorage.setItem(meeting.id, meeting);
    return meeting.id;
}

export async function getMeeting(id: string) {
    return await meetingStorage.getItem(id);
}

export async function updateMeeting(meetingId: string, userId: string, update: UpdateMeeting) {
    let meeting = await getMeeting(meetingId);
    if (meeting) {
        meeting.title = update.title || meeting.title;
        if (update.selectedTimes) {
            meeting.times[userId] = update.selectedTimes.map((slot) => {
                return {
                    start: new Date(slot.start),
                    end: new Date(slot.end),
                } as CalendarTimeslot;
            });
        }
        await meetingStorage.setItem(meetingId, meeting);
        return meeting;
    }
    return null;
}