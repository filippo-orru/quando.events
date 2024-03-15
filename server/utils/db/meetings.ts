import { CalendarTimeslot } from "~/data/Meeting";
import { randomIdChars } from "./db_utils";
import { UpdateMeeting } from "~/server/api/meetings/[...meetingId]/index.patch";
import { useUserInfoStore as useUserStore } from "~/stores/UserInfo";
import { getUserById } from "./users";

// MARK: Types
type DbMeeting = {
    id: string;
    title: string;
    members: { [userId: string]: DbMeetingParticipant };
};

type DbMeetingParticipant = {
    times: CalendarTimeslot[];
};

const meetingStorage = useStorage<DbMeeting>('redis:meetings');

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
        members: {},
    } as DbMeeting;
    await meetingStorage.setItem(meeting.id, meeting);
    return meeting.id;
}

export async function getMeeting(id: string): Promise<Meeting | null> {
    let dbMeeting = await meetingStorage.getItem(id);
    if (!dbMeeting) {
        return null;
    }

    let members = [] as MeetingMember[];
    for (let [userId, participant] of Object.entries(dbMeeting.members)) {
        let user = await getUserById(userId);
        if (user) {
            members.push({
                id: userId,
                name: user.name || 'Unknown',
                times: participant.times,
            });
        }
    }

    return {
        id: dbMeeting.id,
        title: dbMeeting.title,
        members: members,
    };
}

export async function updateMeeting(meetingId: string, userId: string, update: UpdateMeeting) {
    let meeting = await meetingStorage.getItem(meetingId);

    if (meeting) {
        meeting.title = update.title || meeting.title;
        if (update.selectedTimes) {
            meeting.members[userId] = {
                times: update.selectedTimes.map((slot) => {
                    return {
                        start: new Date(slot.start),
                        end: new Date(slot.end),
                    } as CalendarTimeslot;
                }),
            };
        }
        await meetingStorage.setItem(meetingId, meeting);
        return meeting;
    }
    return null;
}

export type Meeting = {
    id: string;
    title: string;
    members: MeetingMember[];
};

export type MeetingMember = {
    id: string;
    name: string;
    times: CalendarTimeslot[];
};