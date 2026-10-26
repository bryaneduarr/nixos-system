import { SPACE } from "../../../constants/render/card-layout.constant.ts";
import { measureVisibleLength } from "./measure-visible-length.service.ts";

export function padVisibleText(text: string, width: number): string {
  return `${text}${SPACE.repeat(width - measureVisibleLength(text))}`;
}
