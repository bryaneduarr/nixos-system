import { expect, test } from "bun:test";
import { splitLeadingCd } from "./split-leading-cd.service.ts";

test("splits a plain cd followed by &&", () => {
  expect(splitLeadingCd("cd /home/example/project && git status")).toEqual({
    kind: "split",
    directory: "/home/example/project",
    command: "git status",
  });
});

test("splits a cd followed by a semicolon and keeps later cd commands", () => {
  expect(splitLeadingCd("cd apps/web; cd src && ls")).toEqual({
    kind: "split",
    directory: "apps/web",
    command: "cd src && ls",
  });
});

test("unquotes quoted directories", () => {
  expect(splitLeadingCd(`cd "/tmp/with space" && ls`)).toEqual({
    kind: "split",
    directory: "/tmp/with space",
    command: "ls",
  });
  expect(splitLeadingCd("cd '~/x' && ls")).toEqual({ kind: "split", directory: "~/x", command: "ls" });
});

test("keeps commands whose cd depends on the shell", () => {
  expect(splitLeadingCd("cd $HOME && ls")).toEqual({ kind: "none" });
  expect(splitLeadingCd("cd $(git rev-parse --show-toplevel) && ls")).toEqual({ kind: "none" });
  expect(splitLeadingCd("cd /tmp || exit 1")).toEqual({ kind: "none" });
  expect(splitLeadingCd("cd /tmp")).toEqual({ kind: "none" });
  expect(splitLeadingCd("git status")).toEqual({ kind: "none" });
});
