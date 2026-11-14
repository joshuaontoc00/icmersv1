export const APP_NAME = "ICMERS";
export const APP_FULL_NAME = "Integrated Campus Medical Emergency Reporting System";
export const CLINIC_NAME = "Dr. Santos";

export const OTHERS = "__others__";
export const OTHERS_LABEL = "Others (specify)";
export const MAX_CUSTOM_LENGTH = 40;
export const MAX_DESCRIPTION_LENGTH = 500;

export const BUILDINGS = ["CET", "CICS", "HEB", "CIT", "CTE", "CABEIHM"] as const;

/** 5 x 5 room table: floors 1–5, rooms 01–05. */
export const ROOM_ROWS: string[][] = [1, 2, 3, 4, 5].map((floor) =>
  [1, 2, 3, 4, 5].map((n) => `${floor}0${n}`),
);

export const LOCATION_ERROR = "Choose a building and room, or select Others and type it in.";
export const LOGIN_ERROR = "Enter your ID and password to continue.";
