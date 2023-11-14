import {
  format,
  isThisMinute,
  isThisWeek,
  isToday,
  isYesterday,
} from "date-fns";
export function getFormatedDate(timestamp: string) {
  let date = new Date(timestamp);

  if (isToday(date)) {
    return format(date, "p");
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }
  if (isThisWeek(date)) {
    return format(date, "eeee");
  } else return format(date, "dd/MMM/yyyy");
}

export function getFormattedDateTime(timestamp: string) {
  let date = new Date(timestamp);
  if (isThisMinute(date)) {
    return "Now";
  }
  if (isToday(date)) {
    return format(date, "HH:mm");
  }
  if (isYesterday(date)) {
    return "Yesterday " + format(date, "HH: mm");
  } else {
    return getFormatedDate(timestamp);
  }
}
