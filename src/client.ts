import { MessagingError, MessagingAPIError, convertArrayToListString } from './utils';
import {
  IOptions,
  IdentityOptions,
  IMessagingClient,
  IRawMessage,
  IMessage,
  IPagination,
  ICreateMessageInput,
} from './types';

const defaultOptions = {
  baseUrl: 'https://messaging.example.com/api/core/v1/apps/2/',
  fetch: undefined,
};

const pathMap: { [key: string]: string } = {
  createMessage: 'messages/',
  deleteMessage: 'messages/{{messageId}}/',
  getMessageDetails: 'messages/{{messageId}}/',
  listMessages: 'messages/',
};

class MessagingClient implements IMessagingClient {
  private options: IOptions;
  private fetch: typeof fetch;

  constructor(private identity: IdentityOptions, options?: IOptions) {
    if (!identity.jwt && !identity.apiKey) {
      throw MessagingError('You must specify a JWT or API Key');
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

  private getNextPage(totalPages: number, currentPage: number) {
    if (currentPage < totalPages) {
      return currentPage + 1;
    }

    return null;
  }

  private mapRawMessage(rawMessage: IRawMessage): IMessage {
    const {
      is_deleted: isDeleted,
      is_sent: isSent,
      audience_type: audienceType,
      audience_display: audienceDisplay,
      schedule_type: scheduleType,
      scheduled_datetime: scheduledDatetime,
      next_send_datetime: nextSendDatetime,
      last_sent_datetime: lastSentDatetime,
      is_recurring: isRecurring,
      recurring_offset: recurringOffset,
      recurring_unit: recurringUnit,
      should_increase_badge: shouldIncreaseBadge,
      payload_options: payloadOptions,
      owner_id: ownerId,
      ...rest
    } = rawMessage;

    return {
      ...rest,
      isDeleted,
      isSent,
      audienceType,
      audienceDisplay,
      scheduleType,
      scheduledDatetime,
      nextSendDatetime,
      lastSentDatetime,
      isRecurring,
      recurringOffset,
      recurringUnit,
      shouldIncreaseBadge,
      payloadOptions,
      ownerId,
    };
  }

  private sub() {
    // Get the body of the JWT.
    if (this.identity.jwt) {
      const payload = this.identity.jwt.split('.')[1];
      // Which is base64 encoded.
      const parsed = JSON.parse(atob(payload));
      return parsed.sub;
    }
    return '';
  }

  private getAuthHeader = () =>
    this.identity.jwt ? `Bearer ${this.identity.jwt}` : `Token ${this.identity.apiKey}`;

  createMessage = async (body: ICreateMessageInput) => {
    const url = this.getUrl('createMessage');
    const {
      audienceType,
      content,
      groups,
      isRecurring,
      metadata,
      payloadOptions,
      recurringOffset,
      recurringUnit,
      recurringEndDatetime,
      scheduledDatetime,
      scheduleType,
      title,
      users,
    } = body;

    const formData = new FormData();
    formData.append('audience_type', audienceType);
    formData.append('content', content);
    formData.append('metadata', JSON.stringify(metadata));
    formData.append('payload_options', JSON.stringify(payloadOptions));
    formData.append('scheduled_datetime', scheduledDatetime);
    formData.append('schedule_type', scheduleType);
    formData.append('title', title);
    if (isRecurring && recurringOffset && recurringUnit) {
      formData.append('is_recurring', '1');
      formData.append('recurring_offset', `${recurringOffset}`);
      formData.append('recurring_unit', recurringUnit);

      if (recurringEndDatetime) {
        formData.append('recurring_end_datetime', recurringEndDatetime);
      }
    }
    if (users) {
      users.forEach(identity => formData.append('identities', identity));
    }
    if (groups) {
      groups.forEach(groupId => formData.append('group_ids', groupId));
    }

    const resp = await this.fetch(url, {
      method: 'POST',
      headers: {
        Authorization: this.getAuthHeader(),
      },
      body: formData,
    });

    if (!resp.ok) {
      throw MessagingAPIError('Unable to create message', resp);
    }

    // TODO: map json response to camelCase for frontend
    const { result: rawMessage } = await resp.json();

    return this.mapRawMessage(rawMessage);
  };

  deleteMessage = async (messageId: string) => {
    const url = this.getUrl('deleteMessage');
    const resp = await this.fetch(url.replace('{{messageId}}', messageId), {
      method: 'DELETE',
      headers: {
        Authorization: this.getAuthHeader(),
      },
    });

    if (!resp.ok) {
      throw MessagingAPIError('Unable to delete message', resp);
    }

    return resp.ok;
  };

  getMessageDetails = async (messageId: string) => {
    const url = this.getUrl('getMessageDetails');
    const resp = await this.fetch(url.replace('{{messageId}}', messageId), {
      method: 'GET',
      headers: {
        Authorization: this.getAuthHeader(),
      },
    });

    if (!resp.ok) {
      throw MessagingAPIError('Unable to get message details', resp);
    }

    return resp.json();
  };

  listMessages = async (page?: number) => {
    const url = this.getUrl('listMessages');
    const resp = await this.fetch(`${url}?page=${page || 1}`, {
      method: 'GET',
      headers: {
        Authorization: this.getAuthHeader(),
      },
    });
    if (!resp.ok) {
      throw MessagingAPIError('Unable to get list of messages', resp);
    }

    const {
      pagination,
      result,
    }: { pagination: IPagination; result: IRawMessage[] } = await resp.json();

    return {
      nextPage: this.getNextPage(pagination.num_pages, pagination.current_page),
      result: result.map(message => this.mapRawMessage(message)),
    };
  };
}

export default MessagingClient;
export { IMessagingClient, IOptions };
