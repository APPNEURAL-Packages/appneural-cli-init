import { Command } from "commander";
import fs from "fs/promises";
import path from "path";
import { logger, withSpinner, input, select, toggle } from "@appneural/cli-shared";
import { withTelemetry } from "@appneural/cli-shared";
import { ValidationError } from "@appneural/cli-shared";

const WORKSPACE_FILE = path.join(process.cwd(), "appneural.workspace.json");

interface WorkspaceConfig {
  name: string;
  mode: "mono" | "poly";
  stack: string;
  docker: boolean;
  ci: boolean;
}

async function saveWorkspaceConfig(config: WorkspaceConfig): Promise<void> {
  await fs.writeFile(WORKSPACE_FILE, JSON.stringify(config, null, 2), "utf-8");
}

export function registerInitCommands(program: Command): void {
  program
    .command("init")
    .description("Initialize an APPNEURAL workspace")
    .action(() =>
      withTelemetry("init:workspace", async () => {
        const name = (await input("APPNEURAL workspace name", { initial: path.basename(process.cwd()) }))?.trim();
        if (!name) {
          throw new ValidationError("APPNEURAL workspace name is required");
        }

        const modeChoice = await select("Select APPNEURAL workspace mode", ["mono", "poly"]);
        const stackChoice = await select("Select APPNEURAL stack", [
          "node",
          "node-react",
          "node-nest",
          "node-fastify"
        ]);
        const enableDocker = await toggle("Enable APPNEURAL Docker support?", "YES", "NO");
        const enableCi = await toggle("Enable APPNEURAL CI workflows?", "YES", "NO");

        const config: WorkspaceConfig = {
          name,
          mode: modeChoice === "mono" ? "mono" : "poly",
          stack: stackChoice,
          docker: enableDocker,
          ci: enableCi
        };

        await withSpinner("Creating APPNEURAL workspace", async () => saveWorkspaceConfig(config));
        logger.success(`APPNEURAL workspace '${config.name}' configured`);
      })
    );
}
