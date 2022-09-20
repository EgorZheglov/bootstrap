import ipTransform from '../src/libs/ip-transform';

describe('testing custom library', (): void => {
  it('testing transforming ipv6 adress', () => {
    const result = ipTransform('::ffff:127.0.0.1');
    expect(result).toEqual('127.0.0.1');
  });

  it('testing transforming ipv4 adress', () => {
    const result = ipTransform('2001:db8:3333:4444:5555:6666:7777:8888');
    expect(result).toEqual('2001:db8:3333:4444:5555:6666:7777:8888');
  });
});
