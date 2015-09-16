///<reference path="../Common/Dictionary.ts" />

module Client.Events {

  import Dictionary = Client.Common.Dictionary;

  export class EventManager {

    private static _handlers = new Dictionary<string, Dictionary<string, Handler[]>>();

    public static on(channel: string, event: string, scope: Object, callback: Function) {
      if (!this._handlers.containsKey(channel))
        this._handlers.add(channel, new Dictionary<string, Handler[]>());
      if (!this._handlers.get(channel).containsKey(event))
        this._handlers.get(channel).add(event, new Array<Handler>());
      this._handlers.get(channel).get(event).push({scope: scope, callback: callback});
    }

    public static off(channel: string, event: string, scope: Object, callback: Function) {
      if (this._handlers.containsKey(channel) && this._handlers.get(channel).containsKey(event)) {
        var handlers = this._handlers.get(channel).get(event);
        for (var i = 0; i < handlers.length; i++) {
          if (handlers[i].scope == scope && handlers[i].callback == callback) {
            handlers.splice(i, 1);
            // TODO remove empty events and channels
            break;
          }
        }
      }
    }

    public static raise(channel: string, event: string, ...args: any[]) {
      var events = this._handlers.get(channel);
      if (!events) {
        console.log(`EventManager: invalid channel '${channel}'`);
        return;
      }
      
      var handlers = events.get(event);
      if (!handlers) {
        console.log(`EventManager: invalid event '${event}'`);
        return;
      }

      for (var handler of handlers)
        handler.callback.call(handler.scope, ...args);
        
      console.log(`EventManager: ${channel} -> ${event}, ${handlers.length} handler(s) called`);
    }
  }
  
  interface Handler {
    scope: Object;
    callback: Function;
  }
}