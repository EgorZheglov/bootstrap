import encryptString from '../../src/libs/encrypt-string';

describe('String encryption library', (): void => {
    const password = 'asdRe457KKm';

    it('Should return encrypted password as string', (): void => {
        const result = encryptString(password);
        
        expect(typeof(result)).toBe('string');
        expect(result.length).toBeGreaterThan(0);
    });
});