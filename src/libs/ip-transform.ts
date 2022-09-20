export default (ip: string): string => {
  if (ip.startsWith('::ffff')) {
    return ip.slice(7);
  }
  return ip;
};
