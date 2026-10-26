/** Characters that draw a card border. */
export interface CardFrame {
  /** Start of the top border: the corner and the rule characters before the title. */
  readonly topLeft: string;
  /** End of the top border. */
  readonly topRight: string;
  /** Start of the bottom border. */
  readonly bottomLeft: string;
  /** End of the bottom border. */
  readonly bottomRight: string;
  /** Character repeated along the top and bottom borders. */
  readonly horizontal: string;
  /** Character repeated along the left and right borders. */
  readonly vertical: string;
}
