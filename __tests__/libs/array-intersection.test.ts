import contains from '../../src/libs/arrays-intersection';

describe('Function check if elements contains in array', (): void => {
  const array: string[] = ['one', 'two', 'three', 'five'];
  const array0: string[] = [];
  const testData1: string[] = ['one', 'two'];
  const testData3: string[] = ['four'];

  it('Should return true if elements are in array', (): void => {
      const result = contains(array, testData1);      
      expect(typeof(result)).toBe("boolean");
      expect(result).toBe(true);
  });

  it('Should return false if array does not contain given elements', (): void => {
    const result = contains(array, testData3);      
    expect(typeof(result)).toBe("boolean");
    expect(result).toBe(false);
  });

  it('Should return false if array is empty and elements are given into array', (): void => {
    const result = contains(array0, testData1);      
    expect(typeof(result)).toBe("boolean");
    expect(result).toBe(false);
  });

});