export const MessagingError = (message: string) => `Messaging Error: ${message}`;

export const MessagingAPIError = (message: string, response: Response) => ({
  message: `Messaging API Error: ${message}`,
  response,
});

export const convertArrayToListString = <T>(arr: T[]): string =>
  arr.reduce((prev, curr, index) => `${prev}${curr}${index === arr.length - 1 ? '' : ','}`, '');
