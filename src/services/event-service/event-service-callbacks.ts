import { event } from '../../libs/log';
import { DummyObject, Events } from '../../types';

const errorCallback = (data: string | DummyObject | null): void => {
  const emitData =
    data instanceof Error
      ? JSON.stringify({
          message: data.message,
          name: data.name,
          stack: data.stack,
        })
      : data;
  event(`[${Events.ERROR}] with current data: ${emitData}`);
};

const sendEmailCallback = (data: string | DummyObject | null): void => {
  const emitData =
    typeof data !== 'string' && data !== null ? JSON.stringify(data) : data;
  event(`[${Events.SEND_EMAIL}] with current data: ${emitData}`);
};

const userCreatedCallback = (data: string | DummyObject | null): void => {
  const emitData =
    typeof data !== 'string' && data !== null ? JSON.stringify(data) : data;
  event(`[${Events.USER_REGISTERED}] with current data: ${emitData}`);
};

const userUpdatedCallback = (data: string | DummyObject | null): void => {
  const emitData =
    typeof data !== 'string' && data !== null ? JSON.stringify(data) : data;
  event(`[${Events.USER_UPDATED}] with current data: ${emitData}`);
};

const userActivatedCallback = (data: string | DummyObject | null): void => {
  const emitData =
    typeof data !== 'string' && data !== null ? JSON.stringify(data) : data;
  event(`[${Events.USER_ACTIVATED}] with current data: ${emitData}`);
};

export {
  sendEmailCallback,
  userCreatedCallback,
  userUpdatedCallback,
  userActivatedCallback,
  errorCallback,
};
