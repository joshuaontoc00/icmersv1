import { describe, expect, it } from "vitest";
import { flashTitleAt, shouldNotify } from "./background-alerts";

describe("background alerts", () => {
  it("notifies only when the tab is hidden and permission is granted", () => {
    expect(shouldNotify(true, "granted")).toBe(true);
    expect(shouldNotify(false, "granted")).toBe(false);
    expect(shouldNotify(true, "denied")).toBe(false);
    expect(shouldNotify(true, "default")).toBe(false);
    expect(shouldNotify(true, "unsupported")).toBe(false);
  });

  it("flashes the title between ICMERS and the emergency text", () => {
    expect(flashTitleAt(0)).toBe("ICMERS");
    expect(flashTitleAt(1)).toBe("🚨 New emergency!");
    expect(flashTitleAt(2)).toBe("ICMERS");
  });
});
