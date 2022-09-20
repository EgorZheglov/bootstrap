import dbg from 'debug';

import eventService from '../services/event-service';
import { DummyObject, Events } from '../types';

const error = (err: string | DummyObject | null) => {
  const dbgErr = dbg('log:error');
  dbgErr(err);
  eventService(Events.ERROR, err);
};

const info = dbg('info');
info.log = console.log.bind(console);

const debug = dbg('debug');
debug.log = console.log.bind(console);

const event = dbg('log:event');

export { debug, error, info, event };
