import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import LocalCache from "./localCache";
import { getSettings } from "app/shared-components/cache/cacheCallbacks";
import format from 'date-fns';
import { DateTime } from 'luxon';
import moment from "moment-timezone";
import { getTimeZoneSettings } from "./getSettings";

export function formatDate(timestamp, format = "") {
  const date = new Date(timestamp);
  const formattedDate = date.toLocaleDateString('en', {
    day: '2-digit',   // Two-digit day, e.g., '01'
    month: 'short',   // Short month, e.g., 'Sep'
    year: 'numeric',  // Four-digit year, e.g., '2024'
  });
  const dayOfWeek = date.toLocaleString('en', { weekday: 'short' });
  let datesArray = formattedDate.split(' ');
  const day = datesArray[1].replace(',', '');
  const month = datesArray[0];
  const year = datesArray[2];

  if (format === 'ddd DD MMM') {
    return `${dayOfWeek} ${day} ${month}`;
  } else {
    return `${day} ${month} ${year}`;
  }
}

export function checkDate(date: string, operator: string, timeChecking = true) {
  const givenDateTime = new Date(date);
  const currentDateTime = new Date();
  if (timeChecking) {
    givenDateTime.setHours(0, 0, 0, 0);
    currentDateTime.setHours(0, 0, 0, 0);
  }

  let isBeforeCurrentDateTime = true;
  switch (operator) {
    case 'lessThan':
      isBeforeCurrentDateTime = givenDateTime < currentDateTime;
      break;
    case 'lessThanOrEqual':
      isBeforeCurrentDateTime = givenDateTime <= currentDateTime;
      break;
    case 'greaterThan':
      isBeforeCurrentDateTime = givenDateTime > currentDateTime;
      break;
    case 'greaterThanOrEqual':
      isBeforeCurrentDateTime = givenDateTime >= currentDateTime;
      break;
    default:
      isBeforeCurrentDateTime = givenDateTime < currentDateTime;
      break;
  }
  return isBeforeCurrentDateTime;
}

export function parseDate(dateString: string): Date {
  const [day, month, year] = dateString.split("/").map(Number);
  return new Date(year, month - 1, day); // month is zero-indexed
}

export const formatDateForExpo = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export const getTimer = (date) => {
  return date;
}

const replaceTimeWithZeroes = (dateString) => {
  if (!dateString.includes('T')) return dateString;
  return dateString.split('T')[0] + 'T00:00:00.000Z';
};

export const expoFormatDate = (date, dateOnly = false, endDate = false, format = false, timeZone: string, datePicker = false) => {
  if (!date || isNaN(new Date(date).getTime())) {
    return null;
  }
  if (endDate) {
    date = moment(date).startOf('day');
  }

  const formattedDate = moment.utc(date).tz(timeZone || moment.tz.guess()).format('YYYY-MM-DD');
  if (datePicker) {
    return moment(formattedDate);
  }

  const d = new Date(formattedDate);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const monthString = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(d);
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  if (dateOnly) {
    return `${day} ${monthString} ${year}`;
  } else if (format) {
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } else {
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
};

export const expoFormatDateCheck = (date,timeZone: string) => {
  if (!date || isNaN(new Date(date).getTime())) {
    return null;
  }
  const formattedDate = moment.utc(date).tz(timeZone || moment.tz.guess()).format('YYYY-MM-DD HH:mm:ss');

  const d = new Date(formattedDate);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const monthString = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(d);
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

 
    //return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  
};

// export const expoFormatDate = (date, dateOnly = false, endDate = false, format = false, timeZone: string, datePicker = false) => {
//   if (endDate) {
//     date = replaceTimeWithZeroes(date);
//   }
//   const formattedDate = moment.utc(date).tz((timeZone && timeZone !== '') ? timeZone : moment.tz.guess()).format("YYYY-MM-DD");
//   const d = new Date(formattedDate);
//   const year = d.getFullYear();
//   const month = String(d.getMonth() + 1).padStart(2, '0');
//   const monthString = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(d);
//   const day = String(d.getDate()).padStart(2, '0');
//   const hours = String(d.getHours()).padStart(2, '0');
//   const minutes = String(d.getMinutes()).padStart(2, '0');
//   const seconds = String(d.getSeconds()).padStart(2, '0');
//   if (datePicker) {

//   } else if (dateOnly) {
//     return `${day} ${monthString} ${year}`;
//   } else if (format) {
//     return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
//   }
//   else {
//     return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
//   }
// };

export const scheduleTimeFormat = (dateTime: any, timeZone = '') => {
  if (dateTime) {
    // const formattedDate = moment
    //   .utc(dateTime)
    //   .format('hh:mm a');

    // return formattedDate;
    // timeZone = '';
    const validTimeZone = timeZone && moment.tz.zone(timeZone) ? timeZone : moment.tz.guess();
    const formattedDate = moment.utc(dateTime).tz(validTimeZone).format('hh:mm a');
    return formattedDate;
  }


};
export const scheduleTimeFormat1 = (dateTime: any, timeZone = '') => {
  if (dateTime) {
    // const formattedDate = moment
    //   .utc(dateTime)
    //   .format('hh:mm a');

    // return formattedDate;
    // timeZone = '';
    //const validTimeZone = timeZone && moment.tz.zone(timeZone) ? timeZone : moment.tz.guess();
    // const formattedDate = moment.utc(dateTime).tz(validTimeZone).format('hh:mm a');
    return moment.utc(dateTime).format('hh:mm a'); 
    //return formattedDate;
  }


};

export const scheduleDateFormat = (dateTime, includeTime, timeZone) => {
  const dateObj = new Date(dateTime);
  const validTimeZone = timeZone && moment.tz.zone(timeZone) ? timeZone : moment.tz.guess();
  const formattedDate = moment.utc(dateTime).tz(validTimeZone);
  //return formattedDate;
  // Format date as "02 Jan 2025"
  const date = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(formattedDate);

  // Format time as "HH:MM AM/PM" (optional)
  // const time = includeTime
  //   ? dateObj.toLocaleTimeString([], {
  //       hour: '2-digit',
  //       minute: '2-digit',
  //       hour12: true,
  //     })
  //   : null;

  return date;
};

export const dateFix = (date1) => {
  const date = new Date(date1);
  const pad = (num) => String(num).padStart(2, "0");
  const formattedDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  return formattedDate;
};

export const forReport = (dateTime: any, timeZone = '', type ='date') => {
  if (dateTime) {
    const validTimeZone = timeZone && moment.tz.zone(timeZone) ? timeZone : moment.tz.guess();
    let formattedDate ='';
    if(type== 'date'){
      formattedDate = moment.utc(dateTime).tz(validTimeZone).format('YYYY-MM-DD z');

    } else {
      formattedDate = moment.utc(dateTime).tz(validTimeZone).format('YYYY-MM-DD HH:mm:ss z');
    }
    return formattedDate;
  }


};