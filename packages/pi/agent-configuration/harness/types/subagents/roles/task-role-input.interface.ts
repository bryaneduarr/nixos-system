/* Raw role selection from a task request, resolved into a role at the entry of role resolution. */
export interface TaskRoleInput {
  /* Requested role name; omitted selects the generic task role. */
  readonly role?: string;
  /* Requested tools; omitted selects the role's default tools. */
  readonly tools?: readonly string[];
  /* Approved verification commands; omitted approves none. */
  readonly verificationCommands?: readonly string[];
}
