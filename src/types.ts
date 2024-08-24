export interface Heading {
  depth: number;
  text: string;
  id: string;
  children: Heading[];

  /**
   * @deprecated 使用 .depth 代替
   */
  level: number;
}
