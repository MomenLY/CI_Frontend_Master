import { getAttendeeCountAPI } from "src/app/main/expo-management/manage/attendees/apis/Get-AttendeeCount-Api";
import LocalCache from "./localCache"
import { truncateSync } from "fs";
import { getSingleExpo } from "src/app/main/expo-management/apis/Get-Single-Expo-Api";

export const seatLimit = async (expoId: string) => {
    const expos = await getSingleExpo(expoId);

    if (!expos || !expos.expo) return false; // Ensure expo data exists

    const attendeeCount = await getAttendeeCountAPI(expoId);
    if (!attendeeCount) return false; // Ensure attendee count is valid

    const { expIsSeatsUnlimited, expMaxSeats } = expos.expo;

    if (expIsSeatsUnlimited) {
        return false; // Seats are unlimited, so never full
    }

    if (Number(attendeeCount.count) >= Number(expMaxSeats)) {
        return true; // Seats are full when attendeeCount reaches or exceeds expMaxSeats
    }

    return false; // Seats are still available
};

