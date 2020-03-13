import MessagingClient from './client';

const fetchImpl: any = (response: any, valid: boolean = true) => {
  return jest.fn().mockImplementation((url: string, init: object) => {
    return {
      ok: valid,
      json: () => response,
    };
  });
};

describe('Messaging client', () => {
  it('Should throw if JWT is missing', () => {
    try {
      new MessagingClient({});
    } catch (e) {
      expect(e).toBe('Messaging Error: You must specify a JWT or API Key');
    }
  });
});
