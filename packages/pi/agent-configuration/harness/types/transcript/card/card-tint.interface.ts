/** Background behind a whole card: a faint fill, or the terminal's own background. */
export type CardTint = { readonly tintState: "tinted"; readonly color: string } | { readonly tintState: "plain" };
