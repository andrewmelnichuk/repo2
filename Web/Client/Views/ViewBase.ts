///<reference path="../Events/EventBus.ts" />

module Client.Views {

  import Dictionary = Client.Common.Dictionary;
  import EventBus = Client.Events.EventBus;

  class ViewEventDef {
    constructor (
      public event: string, 
      public selector: string, 
      public handler: (eventObject: JQueryEventObject, ...args: any[]) => any
    ){}
  }
  
  class MgrEventDef {
    constructor(
      public event: string,
      public channel: string,
      public handler: (...args: any[]) => any
    ){}
  }

  class EventDef {
    constructor(
      public event: string,
      public target: string,
      public handler: (...args: any[]) => any
    ){}
  }

  export class ViewBase {

    private _$el: JQuery;
    private _parent: ViewBase;
    private _views: Array<ViewBase> = [];
    private _viewEventDefs: EventDef[];
    private _mgrEventDefs: EventDef[];

    constructor(parent?: ViewBase) {
      if (parent) {
        this._parent = parent;
        this._parent.addChild(this);
      }
      this._$el = $("<div></div>");
      this.bindViewEvents();
      this.bindMgrEvents();
    }

    public get $el(): JQuery {
      return this._$el;
    }

    public get Views(): Array<ViewBase> {
      return this._views;
    }

    protected viewEvents(): Object {
      return {};
    }
    
    protected mgrEvents(): Object {
      return {};
    }
    
    public render(): ViewBase {
      return this;
    }

    public postRender() {
      this._views.forEach(view => view.postRender());
    }

    public show() {
      this.$el.css("display", "block");
      this._views.forEach(view => view.show());
    }

    public hide() {
      this.$el.css("display", "none");
      this._views.forEach(view => view.hide());
    }

    public destroy(): void {
      this._views.forEach(view => view.destroy());
      if (this._parent)
        this._parent.removeChild(this);
      this.unbindViewEvents();
      this.unbindMgrEvents();
      this._$el.remove();
    }
    
    protected addChild(view: ViewBase) {
      this._views.push(view);
    }
    
    protected removeChild(view: ViewBase) {
      var idx= this._views.indexOf(view);
      if (idx >= 0)
        this._views.splice(idx, 1);
    }
    
    private bindViewEvents() {
      if (!this._viewEventDefs)
        this._viewEventDefs = this.parseEventsObj(this.viewEvents());
      for (var def of this._viewEventDefs)
        this._$el.on(def.event, def.target, def.handler);
    }

    private bindMgrEvents() {
      if (!this._mgrEventDefs)
        this._mgrEventDefs = this.parseEventsObj(this.mgrEvents());
      for (var def of this._mgrEventDefs) {
        EventBus.on(def.target, def.event, this, def.handler); 
      }
    }

    private unbindViewEvents() {
      for (var def of this._viewEventDefs)
        this._$el.on(def.event, def.target, def.handler);
    }

    private unbindMgrEvents() {
      for (var def of this._mgrEventDefs)
        EventBus.off(def.target, def.event, this, def.handler);
    }

    private parseEventsObj(eventsObj: Object): EventDef[] {
      var result = new Array<EventDef>();
      for (var key in eventsObj) {
        if (!eventsObj.hasOwnProperty(key))
          continue;
        
        var eventDef = (<string>key).trim();
        var idx = eventDef.indexOf(" ");
        var event, selector, handler;
        if (idx >= 0) {
          event = eventDef.substr(0, idx);
          selector = eventDef.substr(idx + 1);
        }
        else {
          event = eventDef;
        }
        handler = eventsObj[key];
        
        if (event == "")
          throw new Error(`Event definition '${eventDef}' has empty event.`);
        if (selector == "")
          selector = undefined;
        if (typeof handler != "function")
          throw new Error(`Event definition '${eventDef}' has invalid handler.`);

        result.push(new EventDef(event, selector, (...args:any[]) => handler.call(this, ...args)));
      }
      return result;
    }
  }
}