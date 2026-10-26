import { expect, test } from "bun:test";
import { TURN_VIEW_KEY } from "../../../constants/transcript/turn/turn-view.constant.ts";
import { createTurnView } from "./create-turn-view.service.ts";

test("a new view shows only the latest turn", () => {
  const store = createTurnView();
  expect(store.current()).toEqual({ hidden: true, turnsFromLatest: 0 });
  expect(Reflect.get(globalThis, TURN_VIEW_KEY)).toEqual({ hidden: true, turnsFromLatest: 0 });
});

test("focusing a turn hides the others and remembers which turn", () => {
  const store = createTurnView();
  store.toggleHidden();
  store.focus(3);
  expect(Reflect.get(globalThis, TURN_VIEW_KEY)).toEqual({ hidden: true, turnsFromLatest: 3 });
});

test("toggling keeps the focused turn and reset returns to the latest", () => {
  const store = createTurnView();
  store.focus(2);
  store.toggleHidden();
  expect(store.current()).toEqual({ hidden: false, turnsFromLatest: 2 });
  store.reset();
  expect(store.current()).toEqual({ hidden: true, turnsFromLatest: 0 });
});
