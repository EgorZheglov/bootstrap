import pubsub from '../../libs/pubsub';
import { DummyObject, Events } from '../../types';
import {
  sendEmailCallback,
  userActivatedCallback,
  userUpdatedCallback,
  userCreatedCallback,
  errorCallback,
} from './event-service-callbacks';

pubsub.on(Events.ERROR, errorCallback);
pubsub.on(Events.SEND_EMAIL, sendEmailCallback);
pubsub.on(Events.USER_ACTIVATED, userActivatedCallback);
pubsub.on(Events.USER_UPDATED, userUpdatedCallback);
pubsub.on(Events.USER_REGISTERED, userCreatedCallback);

export default (evt: Events, data: string | DummyObject | null): void => {
  pubsub.emit(evt, data);
};
