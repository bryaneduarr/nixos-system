import { expect, test } from "bun:test";
import { computeListScroll } from "./compute-list-scroll.service.ts";

test("keeps the scroll when the selection is visible", () => {
  expect(computeListScroll({ previous: 2, length: 20, height: 5, selected: 4 })).toBe(2);
});

test("scrolls up to a selection above the window", () => {
  expect(computeListScroll({ previous: 6, length: 20, height: 5, selected: 3 })).toBe(3);
});

test("scrolls down so a selection below the window is the last visible row", () => {
  expect(computeListScroll({ previous: 0, length: 20, height: 5, selected: 9 })).toBe(5);
});

test("limits the scroll to the last full window", () => {
  expect(computeListScroll({ previous: 30, length: 20, height: 5, selected: 19 })).toBe(15);
});

test("never scrolls a list shorter than its window", () => {
  expect(computeListScroll({ previous: 4, length: 3, height: 5, selected: 2 })).toBe(0);
});

test("never scrolls an empty list", () => {
  expect(computeListScroll({ previous: 0, length: 0, height: 5, selected: 0 })).toBe(0);
});

test("never returns a negative scroll", () => {
  expect(computeListScroll({ previous: 0, length: 20, height: 5, selected: -1 })).toBe(0);
});
