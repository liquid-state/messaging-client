import { MessagingError, MessagingAPIError } from './utils';
import { IOptions, IMessagingClient } from './types';

const defaultOptions = {
  baseUrl: 'https://messaging.example.com/api/core/v1/apps/2/',
  fetch: undefined,
};

const pathMap: { [key: string]: string } = {
  getMessageDetails: 'messages/{{messageId}}',
  listMessages: 'messages/',
};

class MessagingClient implements IMessagingClient {
  private options: IOptions;
  private fetch: typeof fetch;

  constructor(private jwt: string, options?: IOptions) {
    if (!jwt) {
      throw MessagingError('You must specify a JWT');
    }
    if (!options) {
      this.options = defaultOptions;
    } else {
      this.options = { ...defaultOptions, ...options };
      if (!this.options.baseUrl) {
        this.options.baseUrl = defaultOptions.baseUrl;
      }
    }
    this.fetch = this.options.fetch || window.fetch.bind(window);
  }

  private getUrl(endpoint: string) {
    let result;
    result = `${this.options.baseUrl}${pathMap[endpoint]}`;
    return result;
  }

  private sub() {
    // Get the body of the JWT.
    const payload = this.jwt.split('.')[1];
    // Which is base64 encoded.
    const parsed = JSON.parse(atob(payload));
    return parsed.sub;
  }

  getMessageDetails = async (messageId: string) => {
    const url = this.getUrl('getMessageDetails');
    const resp = await this.fetch(url.replace('{{messageId}}', messageId), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.jwt}`,
      },
    });

    if (!resp.ok) {
      throw MessagingAPIError('Unable to get pathways user details', resp);
    }

    return resp.json();
  };

  listMessages = async (page?: number) => {
    const url = this.getUrl('listMessages');
    const resp = await this.fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.jwt}`,
      },
    });
    if (!resp.ok) {
      throw MessagingAPIError('Unable to get pathways user details', resp);
    }

    return resp.json();
  };
}

export default MessagingClient;
export { IMessagingClient, IOptions };
