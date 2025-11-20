import { Command } from "commander";
import { registerInitCommands } from "./commands/init.js";

export default function register(program: Command): void {
  registerInitCommands(program);
}
