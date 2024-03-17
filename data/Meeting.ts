import type { MeetingMember } from "~/server/utils/db/meetings";

export type MeetingSerialized = {
    id: string;
    title: string;
    members: MeetingMemberSerialized[];
};

export type MeetingMemberSerialized = {
    id: string;
    name: string;
    times: CalendarTimeslotSerialized[];
};

export function serializeMeeting(meeting: Meeting): MeetingSerialized {
    return {
        id: meeting.id,
        title: meeting.title,
        members: meeting.members.map((member) => {
            return {
                id: member.id,
                name: member.name,
                times: member.times.map(serializeCalendarTimeslot),
            } as MeetingMemberSerialized;
        }),
    };
}

export function deserializeMeeting(meeting: MeetingSerialized): Meeting {
    return {
        id: meeting.id,
        title: meeting.title,
        members: meeting.members.map((member) => {
            return {
                id: member.id,
                name: member.name,
                times: member.times.map((time) => deserializeCalendarTimeslot(time)),
            } as MeetingMember;
        }),
    };
}

export interface CalendarTimeslot {
    start: Date;
    end: Date;
}

export function deserializeCalendarTimeslot(slot: CalendarTimeslotSerialized): CalendarTimeslot {
    return {
        start: new Date(slot.start),
        end: new Date(slot.end),
    };
}

export function serializeCalendarTimeslot(slot: CalendarTimeslot): CalendarTimeslotSerialized {
    return {
        start: slot.start.getTime(),
        end: slot.end.getTime(),
    };
}

export interface CalendarTimeslotSerialized {
    start: number;
    end: number;
}

export interface CalendarEntry extends CalendarTimeslot {
    id: String;
    title: string;
};

export type CalendarImportSource = 'google';

export interface ImportedCalendarEntry extends CalendarEntry {
    source: CalendarImportSource
};