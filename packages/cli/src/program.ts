import { Command } from "commander";
import pkg from "../package.json";
import { contextCommand } from "./commands/context";

export function createProgram(): Command {
	const program = new Command();
	program
		.name("maina")
		.description("Verification-first developer operating system")
		.version(pkg.version);
	program.addCommand(contextCommand());
	return program;
}
