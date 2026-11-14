import { MAX_CUSTOM_LENGTH, OTHERS } from "./constants";

export type LocationInput = {
  building: string;
  buildingOther: string;
  room: string;
  roomOther: string;
};

/** Turns the form selections into the final building and room, or null when incomplete. */
export function resolveLocation(input: LocationInput): { building: string; room: string } | null {
  const building = input.building === OTHERS ? input.buildingOther.trim() : input.building.trim();
  const room = input.room === OTHERS ? input.roomOther.trim() : input.room.trim();
  if (!building || !room) return null;
  if (building.length > MAX_CUSTOM_LENGTH || room.length > MAX_CUSTOM_LENGTH) return null;
  return { building, room };
}
