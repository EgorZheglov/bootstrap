import hashMaker from '../../src/libs/hash-maker';

describe('Test hash maker lib', (): void => {
    it('Empty payload should return empty string', (): void => {
        const payload = {};
        const hashed = hashMaker(payload);

        expect(typeof(hashed)).toBe('string');
        expect(hashed).toBe('');
    });

    it('Payload parameter with any count of values should return hashed string', (): void => {
        const example = 'test-key1test-key2test-key3test-key4test-key5test-key6test-key7test-key8test-key9test-key10';
        const hashedExample = Buffer.from(example).toString('base64');
        const payload = {
            testKey1: 'test-key1',
            testKey2: 'test-key2',
            testKey3: 'test-key3',
            testKey4: 'test-key4',
            testKey5: 'test-key5',
            testKey6: 'test-key6',
            testKey7: 'test-key7',
            testKey8: 'test-key8',
            testKey9: 'test-key9',
            testKey10: 'test-key10',
        };        

        const hashed = hashMaker(payload);

        expect(typeof(hashed)).toBe('string');
        expect(hashed.length).toBeGreaterThan(0);
        expect(hashed).toBe(hashedExample);
    });

    it('Payload parameter with numeric values should return hashed string', (): void => {
        const example = '123456789';
        const hashedExample = Buffer.from(example).toString('base64');
        const payload = {
            testKey1: 123,
            testKey2: 456,
            testKey3: 789
        };        

        const hashed = hashMaker(payload);

        expect(typeof(hashed)).toBe('string');
        expect(hashed.length).toBeGreaterThan(0);
        expect(hashed).toBe(hashedExample);
    });

    it('Payload parameter with different type of values should return hashed string', (): void => {
        const example = '123test-stringfunction () { }[object Object]7,8,9';
        const hashedExample = Buffer.from(example).toString('base64');
        const payload = {
            testKey1: 123,
            testKey2: 'test-string',
            testKey3: function() {},
            testKey4: {
                testKey6: 'test-key4',
                testKey7: 'test-key5'
            },
            testKey5: [7, 8, 9],
        };       
        
        const hashed = hashMaker(payload);

        expect(typeof(hashed)).toBe('string');
        expect(hashed.length).toBeGreaterThan(0);
        expect(hashed).toBe(hashedExample);
    });
});
