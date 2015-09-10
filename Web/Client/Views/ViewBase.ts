module Client.Views {

  import Dictionary = Client.Common.Dictionary;
  import EventBus = Client.Events.EventBus;
  
  export interface IViewEvent {
    event: string;
    selector: string;
    handler: (eventObject: JQueryEventObject, ...args: any[]) => any;
  }
  
  interface ViewEvent {
    event: string;
    selector: string;
    handler: (eventObject: JQueryEventObject, ...args: any[]) => any;
  }
  
  interface BusEvent {
    event: string;
    channel: string;
    handler: (...args: any[]) => void;
  }
  
  export class ViewBase {

    private _$el: JQuery;
    private _parent: ViewBase;
    private _views: Array<ViewBase> = [];
    private _events: Array<IViewEvent> = [];
    private _viewEvents: {event: string, target: string, handler: Function};
    private _busEvents: Object;

    constructor(parent?: ViewBase) {
      if (parent) {
        this._parent = parent;
        this._parent.addChild(this);
      }
      this._$el = $("<div></div>");
      this._events = this.events();
      this.bindEvents();
      this.bindViewEvents();
      this.bindBusEvents();
      this.initialize();
    }

    public get $el(): JQuery {
      return this._$el;
    }

    public get Views(): Array<ViewBase> {
      return this._views;
    }

    protected initialize() {
    }

    public events(): Array<IViewEvent> {
      return [];
    }
    
    public viewEvents(): Object {
      return {
        "click .btn" : () => 1,
        "click .lnk" : () => 2
      };
    }
    
    public busEvents(): Object {
      return {
        "ui.content-view change" : () => 1,
        "click .lnk" : () => 2
      };
    } 

    public render() {
      this._views.forEach(view => view.render());
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
      this.unbindEvents();
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
    
    private bindEvents(): void {
      this._events.forEach(event => {
        this._$el.on(event.event, event.selector, event.handler.bind(this));
      });
    }

    private unbindEvents() {
      this._events.forEach(event => {
        this._$el.off(event.event, event.selector, event.handler);
      });
    }

    private bindViewEvents() {
      if (!this._viewEvents)
        this.parse
      for (var item in this._viewEvents) {
        if (this._viewEvents.hasOwnProperty(item)) {
          var result = this.parse(item);
          this._$el.on(result.event, result.target, this._viewEvents[item].bind(this));
        }
      }
    }

    private bindBusEvents() {
      for (var item in this._busEvents) {
        if (this._busEvents.hasOwnProperty(item)) {
          var result = this.parse(item);
          EventBus.Instance.on(result.target, result.event, this, this._busEvents[item]); 
        }
      }
    }

    private unbindViewEvents() {
      for (var item in this._viewEvents) {
        if (this._viewEvents.hasOwnProperty(item)) {
          var result = this.parse(item);
          this._$el.on(result.event, result.target, this._viewEvents[item].bind(this));
        }
      }
      this._viewEvents.forEach(event => {
        this._$el.off(event.event, event.selector, event.handler);
      });
    }

    private parse(item: string) : {event: string, target: string} {
      return {
        event: "event",
        target: "selector"
      };
    }
  }
}