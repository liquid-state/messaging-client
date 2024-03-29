export interface IMessagingClient {
  createMessage(body: ICreateMessageInput): Promise<any>;
  deleteMessage(messageId: string): Promise<boolean>;
  listMessages(
    page?: number,
    ownerId?: string,
    status?: 'sent' | 'scheduled'
  ): Promise<{
    nextPage: number | null;
    result: IMessage[];
  }>;
}

export interface IOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
}

export interface IdentityOptions {
  jwt?: string;
  apiKey?: string;
}

export interface ICreateMessageInput {
  title: string;
  content: string;
  audienceType: 'all' | 'segemented';
  scheduleType: 'one_off' | 'scheduled';
  scheduledDatetime: string;
  payloadOptions: { [key: string]: any };
  metadata: { [key: string]: any };
  isRecurring?: boolean;
  recurringOffset?: number;
  recurringUnit?: string;
  recurringEndDatetime?: string;
  users?: string[];
  groups?: string[];
  ownerId?: string;
}

export interface IRawMessage {
  id: number;
  is_deleted: boolean;
  deleted: boolean;
  app: number;
  is_sent: boolean;
  title: string;
  content: string;
  audience_type: string;
  audience_display: string;
  schedule_type: string;
  scheduled_datetime: string;
  next_send_datetime: string;
  last_sent_datetime: string;
  is_recurring: boolean;
  recurring_offset: number;
  recurring_unit: string;
  should_increase_badge: boolean;
  payload_options: { [key: string]: any };
  owner_id: string;
  users: string[];
  groups: string[];
}

export interface IMessage {
  id: number;
  isDeleted: boolean;
  deleted: boolean;
  app: number;
  isSent: boolean;
  title: string;
  content: string;
  audienceType: string;
  audienceDisplay: string;
  scheduleType: string;
  scheduledDatetime: string;
  nextSendDatetime: string;
  lastSentDatetime: string;
  isRecurring: boolean;
  recurringOffset: number;
  recurringUnit: string;
  shouldIncreaseBadge: boolean;
  payloadOptions: { [key: string]: any };
  ownerId: string;
  users: string[];
  groups: string[];
}

export interface IPagination {
  current_page: number;
  num_pages: number;
  num_total: number;
}
