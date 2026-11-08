import { expect, test } from "bun:test";
import { resolveDeadlineMs } from "../domain/deadline.js";

test("omitted deadlines expire in ten minutes; explicit zero opts out", () => {
  expect(resolveDeadlineMs(undefined, 1_000)).toBe(601_000n);
  expect(resolveDeadlineMs(0n, 1_000)).toBe(0n);
  expect(resolveDeadlineMs(2_000n, 1_000)).toBe(2_000n);
  expect(() => resolveDeadlineMs(-1n)).toThrow();
  expect(() => resolveDeadlineMs(1n << 64n)).toThrow();
});
