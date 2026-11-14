import { describe, expect, it } from "vitest";
import { resolveLocation } from "./location";
import { OTHERS, ROOM_ROWS } from "./constants";

const base = { building: "", buildingOther: "", room: "", roomOther: "" };

describe("resolveLocation", () => {
  it("uses the chosen building and room", () => {
    expect(resolveLocation({ ...base, building: "CET", room: "101" })).toEqual({
      building: "CET",
      room: "101",
    });
  });

  it("requires both a building and a room", () => {
    expect(resolveLocation({ ...base, building: "CET" })).toBeNull();
    expect(resolveLocation({ ...base, room: "101" })).toBeNull();
  });

  it("uses typed text when Others is chosen for the building", () => {
    expect(
      resolveLocation({ ...base, building: OTHERS, buildingOther: "  Gym  ", room: "201" }),
    ).toEqual({ building: "Gym", room: "201" });
  });

  it("uses typed text when Others is chosen for the room", () => {
    expect(
      resolveLocation({ ...base, building: "CICS", room: OTHERS, roomOther: "Lobby" }),
    ).toEqual({ building: "CICS", room: "Lobby" });
  });

  it("rejects Others with nothing typed", () => {
    expect(
      resolveLocation({ ...base, building: OTHERS, buildingOther: "  ", room: "101" }),
    ).toBeNull();
    expect(resolveLocation({ ...base, building: "CET", room: OTHERS, roomOther: "" })).toBeNull();
  });

  it("rejects typed locations longer than 40 characters", () => {
    expect(
      resolveLocation({ ...base, building: OTHERS, buildingOther: "x".repeat(41), room: "101" }),
    ).toBeNull();
    expect(
      resolveLocation({ ...base, building: OTHERS, buildingOther: "x".repeat(40), room: "101" }),
    ).not.toBeNull();
  });
});

describe("room table", () => {
  it("is 5 rows of 5 rooms from 101 to 505", () => {
    expect(ROOM_ROWS).toHaveLength(5);
    expect(ROOM_ROWS[0]).toEqual(["101", "102", "103", "104", "105"]);
    expect(ROOM_ROWS[4]).toEqual(["501", "502", "503", "504", "505"]);
  });
});
