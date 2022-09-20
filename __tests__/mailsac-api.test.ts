import nock from 'nock';

import { emailValidation } from '../src/services/validation.service';
import { MAILSAC_URL } from '../src/config';

describe('Testing mailsac api', (): void => {
  it("Should return 'false' when email is empty", async () => {
    const emptyEmail = '';
    const response = await emailValidation(emptyEmail);
    expect(response).toBe(false);
  });

  it("Should return 'false' when email is not valid", async () => {
    const email = 'testemail@gm_ail.com';
    const mailsacMock = nock(MAILSAC_URL)
      .get(`/${email}`)
      .reply(200, {
        email: 'testemail@gm_ail.com',
        domain: '',
        isValidFormat: false,
        local: 'testemail@gm_ail.com',
        isDisposable: false,
        disposableDomains: [],
        aliases: [],
      });

    const result = await emailValidation(email);
    mailsacMock.done();
    expect(result).toBe(false);
  });

  it("Should return 'true' when email is valid", async () => {
    const email = 'testemail@test.com';
    const mailsacMock = nock(MAILSAC_URL)
      .get(`/${email}`)
      .reply(200, {
        email: 'testemail@test.com',
        domain: 'test.com',
        isValidFormat: true,
        local: 'testemail',
        isDisposable: false,
        disposableDomains: [],
        aliases: ['67.225.146.248'],
      });

    const result = await emailValidation(email);
    mailsacMock.done();
    expect(result).toBe(true);
  });
});
