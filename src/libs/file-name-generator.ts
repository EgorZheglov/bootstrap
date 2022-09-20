export default (name: string): string =>
  `${(new Date().getTime() / 1000).toString()}-${name}`;
