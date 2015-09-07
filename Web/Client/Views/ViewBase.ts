module Client.Views {
  
  export interface IViewEvent {
    event: string;
    selector: string;
    handler: (eventObject: JQueryEventObject, ...args: any[]) => any;
  }
  
  export class ViewBase {

    private hello: number = 1;
    private _$el: JQuery;
    private _parent: ViewBase;
    private _views: Array<ViewBase> = [];
    private _events: Array<IViewEvent> = [];
    
    constructor(parent?: ViewBase) {
      if (parent) {
        this._parent = parent;
        this._parent.addChild(this);
      }
      this._$el = $("<div></div>");
      this._events = this.events();
      this.initialize();
      this.bindEvents();
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
    
    private unbindEvents(): void {
      this._events.forEach(event => {
        this._$el.off(event.event, event.selector, event.handler);
      });
    }
  }
}