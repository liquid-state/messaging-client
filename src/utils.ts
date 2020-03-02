export const MessagingError = (message: string) => `Messaging Error: ${message}`;

export const MessagingAPIError = (message: string, response: Response) => ({
  message: `Messaging API Error: ${message}`,
  response,
});
