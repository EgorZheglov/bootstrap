export default function (payload: Record<string, unknown>): string {
  const string = Object.values(payload).reduce(
    (acc: string, el: any): string => `${acc}${el}`,
    ''
  );

  return Buffer.from(string).toString('base64');
}
