import { describe, expect, test } from "bun:test";
import { createProgram } from "../program";

describe("maina CLI", () => {
	test("--version outputs a valid semver string", () => {
		const program = createProgram();
		const version = program.version();
		expect(version).toMatch(/^\d+\.\d+\.\d+$/);
	});

	test("program name is maina", () => {
		const program = createProgram();
		expect(program.name()).toBe("maina");
	});

	test("program description is set", () => {
		const program = createProgram();
		expect(program.description()).toBeTruthy();
	});
});
