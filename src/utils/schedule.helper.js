import { expoFormatDateCheck, scheduleTimeFormat } from "./dateformatter";
import { getTimeZoneSettings } from "./getSettings";

async function formatTime(startDateTime, endDateTime) {
    // const start = new Date(startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    // const end = new Date(endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const timeZone = await getTimeZoneSettings();
    const start = scheduleTimeFormat(startDateTime, timeZone);
    const end = scheduleTimeFormat(endDateTime, timeZone);
    return `${start} - ${end}`;
}

async function formatTimeFix(startDateTime, endDateTime) {
    const start = new Date(startDateTime);
    const startTime = start.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    });
    const end = new Date(endDateTime);
    const endTime = end.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    });
    return `${startTime} - ${endTime}`;
}

function timeDifference(schStartDateTime, schEndDateTime) {
    const differenceInMs = new Date(schEndDateTime) - new Date(schStartDateTime);
    const totalMinutes = Math.floor(differenceInMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const minutes = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hours} hours ${minutes} mins`;
}

function formatDate(isoString) {
    const date = new Date(isoString);
    const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    return date.toLocaleDateString('en-GB', options);
}
// export function groupAndSortByDate(events) {
//     const grouped = events.reduce(async (acc, event) => {
//         const { hallName, schName, schStartDateTime, schEndDateTime, speakers, schType, schParticipantLink, schBackstageLink, schStreamingLink, schSpeakerLink, schDuration, id } = event;
//         const date = new Date(schStartDateTime).toISOString().split('T')[0];
//         const eventData = {
//             time: await formatTime(schStartDateTime, schEndDateTime),
//             hours: timeDifference(schStartDateTime, schEndDateTime),//((new Date(schEndDateTime) - new Date(schStartDateTime)) / (1000 * 60 * 60)).toFixed(2) + " Hours",
//             event: schName,
//             speakers: speakers,
//             schType: schType,
//             schParticipantLink: schParticipantLink,
//             schBackstageLink: schBackstageLink,
//             schStreamingLink: schStreamingLink,
//             schSpeakerLink: schSpeakerLink,
//             schStartDateTime:formatDate(schStartDateTime),
//             eventStartDateTime:schStartDateTime,
//             eventEndDateTime:schEndDateTime,
//             schId:id
//         };

//         if (!acc[date]) {
//             acc[date] = {};
//         }
//         if (!acc[date][hallName]) {
//             acc[date][hallName] = [];
//         }
//         acc[date][hallName].push(eventData);

//         return acc;
//     }, {});

//     for (const date in grouped) {
//         for (const hall in grouped[date]) {
//             grouped[date][hall].sort((a, b) => new Date(`1970-01-01T${a.time.split(' - ')[0]}`) - new Date(`1970-01-01T${b.time.split(' - ')[0]}`));
//         }
//     }

//     const sortedData = Object.keys(grouped)
//     .sort((a, b) => new Date(a) - new Date(b))
//     .reduce((acc, key) => {
//         acc[key] = grouped[key];
//         return acc;
//     }, {});

//     return sortedData;
// }

const formatDates = async (dateTime) => {
    const timeZone = await getTimeZoneSettings();
    return expoFormatDateCheck(dateTime, timeZone);
}
export async function groupAndSortByDate(events) {
    const grouped = {};
    for (const event of events) {
        let {
            hallName,
            schName,
            schStartDateTime,
            schEndDateTime,
            speakers,
            schType,
            schParticipantLink,
            schBackstageLink,
            schStreamingLink,
            schSpeakerLink,
            schDuration,
            ssUserId,
            id,
        } = event;
        schStartDateTime = await formatDates(schStartDateTime);
        schEndDateTime = await formatDates(schEndDateTime);
        const date1 = await formatDates(schStartDateTime);
        const date = new Date(date1).toISOString().split('T')[0];
        const time = await formatTimeFix(schStartDateTime, schEndDateTime);

        const eventData = {
            time,
            hours: timeDifference(schStartDateTime, schEndDateTime),
            event: schName,
            speakers,
            schType,
            schParticipantLink,
            schBackstageLink,
            schStreamingLink,
            schSpeakerLink,
            schStartDateTime: formatDate(schStartDateTime),
            eventStartDateTime: schStartDateTime,
            eventEndDateTime: schEndDateTime,
            schId: id,
            ssUserId
        };

        if (!grouped[date]) {
            grouped[date] = {};
        }
        if (!grouped[date][hallName]) {
            grouped[date][hallName] = [];
        }
        grouped[date][hallName].push(eventData);
    }

    for (const date in grouped) {
        for (const hall in grouped[date]) {
            grouped[date][hall].sort((a, b) =>
                new Date(`1970-01-01T${a.time.split(' - ')[0]}`) -
                new Date(`1970-01-01T${b.time.split(' - ')[0]}`)
            );
        }
    }

    const sortedData = Object.keys(grouped)
        .sort((a, b) => new Date(a) - new Date(b))
        .reduce((acc, key) => {
            acc[key] = grouped[key];
            return acc;
        }, {});

    return sortedData;
}


export function groupWithHallName(schedules) {
    const groupedSchedules = schedules.reduce((acc, schedule) => {
        const { hallName } = schedule;
        if (!acc[hallName]) {
            acc[hallName] = [];
        }
        acc[hallName].push(schedule);
        return acc;
    }, {});

    // Transform groupedSchedules into desired structure
    const transformedSchedules = Object.keys(groupedSchedules).map(hallName => ({
        [hallName]: groupedSchedules[hallName]
    }));

    const sortedSchedules = transformedSchedules.map(group => {
        const hallName = Object.keys(group)[0]; // Extract hallid
        const schedulesArray = group[hallName]; // Get the array of schedules for this hallid
        schedulesArray.sort((a, b) => new Date(a.schStartDateTime) - new Date(b.schStartDateTime)); // Sort by schStartDateTime
        return { [hallName]: schedulesArray }; // Return in the desired format
    });

    return sortedSchedules;
}


export function filterWithHallName(data, hallName) {
    Object.keys(data).forEach(date => {
        Object.keys(data[date]).forEach(key => {
            if (key !== hallName) {
                // Delete the key
                delete data[date][key];
            }
        });
        // If the date key has no other nested keys, delete it
        if (Object.keys(data[date]).length === 0) {
            delete data[date];
        }
    });
    return data;
}

export const searchBySchId = (schId, events) => {
    for (const date in events) {
        const halls = events[date];
        for (const hall in halls) {
            const foundEvent = halls[hall].find(event => event.schId === schId);
            if (foundEvent) {
                return foundEvent;
            }
        }
    }
    return null;
};



