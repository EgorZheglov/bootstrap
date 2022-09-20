import tk from 'timekeeper';

import createWebToken from '../../src/libs/jwt';
import roles from '../../src/libs/roles';

describe('Access and refresh tokens', (): void => {

    afterAll((): void => {
        jest.resetModules();
        tk.reset();
    });

    it('Should check tokens length', (): void => {
        const email = 'token@email.com';
        const jwt = createWebToken.create({email, 'role': roles.userAndAdmin});
        const accessLength = jwt.accessToken.length;
        const refreshLength = jwt.refreshToken.length;

        expect(typeof (jwt.accessToken)).toBe('string');
        expect(typeof (jwt.refreshToken)).toBe('string');
        expect(accessLength).toBeGreaterThan(0);
        expect(refreshLength).toBeGreaterThan(0);
    });

    it('Should check result with valid tokens', (): void => {
        const email = 'token@email.com';
        const jwt = createWebToken.create({email, 'role': roles.userAndAdmin});
        const validateAccessToken = createWebToken.check(jwt.accessToken);
        const validateRefreshToken = createWebToken.check(jwt.refreshToken);

        expect(typeof validateAccessToken).toBe('object');
        expect(typeof validateRefreshToken).toBe('object');
        expect(validateAccessToken).resolves.toEqual(expect.objectContaining({type: 'access'}));
        expect(validateRefreshToken).resolves.toEqual(expect.objectContaining({type: 'refresh'}));
    });

    it('Should check result with invalid tokens', (): void => {
        const email = 'token@email.com';
        const jwt = createWebToken.create({email, 'role': roles.userAndAdmin});

        const invalidAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjYwMDAwfQ.rNK7KllXnzXIDxSsFoYELhxZX1ag_1tO819-_03Q548';
        const invalidRefreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjMwMDAwMH0.Pr5xQ9emiVFkVMZCZn4CJI1VXWOE4tHlTPSXnmAGMBY';

        expect(typeof createWebToken.check(jwt.accessToken)).toBe('object');
        expect(typeof createWebToken.check(jwt.refreshToken)).toBe('object');
        expect(createWebToken.check(invalidAccessToken)).resolves.toBe(false);
        expect(createWebToken.check(invalidRefreshToken)).resolves.toBe(false);
    });

    it('Should check result with time expired', (): void => {
        const email = 'token@email.com';
        const jwt = createWebToken.create({email, 'role': roles.userAndAdmin});
        const accessExpTime = 70000;
        const refreshExpTime = 310000;

        tk.travel(Date.now() + accessExpTime);

        const expiredAccessToken = createWebToken.check(jwt.accessToken);
        const nonExpiredRefreshToken = createWebToken.check(jwt.refreshToken);
        // Checking expired access token and non-expired refresh token.
        expect(expiredAccessToken).resolves.toBe(false);
        expect(typeof nonExpiredRefreshToken).toBe('object');

        tk.travel(Date.now() + refreshExpTime);

        const expiredRefreshToken = createWebToken.check(jwt.refreshToken);
        // Checking expired refresh token.
        expect(expiredRefreshToken).resolves.toBe(false);
    });
});
