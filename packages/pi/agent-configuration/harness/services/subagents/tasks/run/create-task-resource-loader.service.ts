import { DefaultResourceLoader, getAgentDir } from "@earendil-works/pi-coding-agent";
import type { CreateTaskResourceLoaderInput } from "../../../../types/subagents/tasks/run/create-task-resource-loader-input.interface.ts";

export async function createTaskResourceLoader(input: CreateTaskResourceLoaderInput): Promise<DefaultResourceLoader> {
  const selectedSkills = new Set(input.skillNames);
  const loader = new DefaultResourceLoader({
    cwd: input.cwd,
    agentDir: getAgentDir(),
    noExtensions: true,
    noPromptTemplates: true,
    noThemes: true,
    noContextFiles: true,
    systemPrompt: input.systemPrompt,
    skillsOverride: (base) => ({
      skills: base.skills.filter((skill) => selectedSkills.has(skill.name)),
      diagnostics: base.diagnostics,
    }),
  });
  await loader.reload();

  const foundSkillNames = new Set(loader.getSkills().skills.map((skill) => skill.name));
  const missingSkills = [...selectedSkills].filter((name) => !foundSkillNames.has(name));
  if (missingSkills.length > 0) {
    throw new Error(`Unknown skills: ${missingSkills.join(", ")}`);
  }

  return loader;
}
