/* eslint-disable-next-line import/newline-after-import */
import { DummyObject } from '../types';

interface EventCallback {
  (data: string | DummyObject | null): void;
}
interface PubSubEventsObject {
  [key: string]: Array<EventCallback>;
}
class Pubsub {
  private events: PubSubEventsObject = {};

  on(event: string, fn: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [fn];
      return;
    }
    this.events[event].push(fn);
  }

  emit(event: string, data: string | DummyObject | null) {
    if (!this.events[event]) {
      this.events[event] = [];
      return;
    }

    this.events[event].forEach((fn) => fn(data));
  }
}

export default new Pubsub();
