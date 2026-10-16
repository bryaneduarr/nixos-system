/** A value that a source either provided or did not provide. */
export type ValueState<T> = { readonly state: "present"; readonly value: T } | { readonly state: "absent" };
