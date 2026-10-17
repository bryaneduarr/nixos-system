/** A project directory chosen for a new session. */
interface ChosenProject {
  /** Marks that a project directory was chosen. */
  readonly selected: true;
  /** Canonical absolute path of the chosen project directory. */
  readonly path: string;
}

/** No project directory was chosen. */
interface NoProject {
  /** Marks that no project directory was chosen. */
  readonly selected: false;
}

/** Outcome of choosing a project directory for a new session. */
export type ProjectSelection = ChosenProject | NoProject;
