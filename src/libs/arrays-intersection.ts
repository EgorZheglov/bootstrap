export default (where: string[], what: string[]): boolean =>
  what.every((element) => where.includes(element));
