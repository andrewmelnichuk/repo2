module Events {

  export interface IDictionary<TValue> {
    [key: string]: TValue;
  }
  
  export class EventBus {
    
    private static _instance: EventBus = null;
    
    public static get Instance(): EventBus {
      return (EventBus._instance == null)
        ? (EventBus._instance = new EventBus())
        : EventBus._instance;
    }

    private _handlers: IDictionary<IDictionary<Array<IEventHandler>>> = {};
    
    public on(channel: string, event: string, ctx: Object, callback: Function) {
      this._handlers[channel] = this._handlers[channel] || {};
      this._handlers[channel][event] =  this._handlers[channel][event] || new Array<IEventHandler>();

      this._handlers[channel][event].push({ctx: ctx, callback: callback});
    }
    
    public off(channel: string, event: string, ctx: Object, callback: Function) {
      var handlers = (this._handlers[channel] || {})[event];
      if (!handlers)
        return;
      for (var i = 0; i < handlers.length; i++) {
        if (handlers[i].ctx == ctx && handlers[i].callback == callback) {
          handlers.splice(i, 1);
          break;
        }
      }
    }
    
    public fire(channel: string, event: string, ...args: any[]) {
      var handlers = (this._handlers[channel] || {})[event];
      if (handlers)
        handlers.forEach((handler:IEventHandler) => handler.callback.call(handler.ctx, args));
      else
        console.log("handlers for channel '%s', event '%s' not found", channel, event);
    }
  }
  
  interface IEventHandler {
    ctx: Object;
    callback: Function;
  }
}