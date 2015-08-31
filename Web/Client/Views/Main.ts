///<reference path="../_references.ts"/>
///<reference path="TextBox.ts"/>

module Views {

  export class Main extends ViewBase {
    
    private _tbName: TextBox = new TextBox(this);
    
    public render() {
      super.render();
      this.$el.html("hello world");
      
      this.$el.append(this._tbName.$el);
    }
    
    public events(): Array<IViewEvent> {
      return [
        {event: "click", selector: "", handler: this.onClick}
      ];
    }
    
    private onClick() {
      console.log("click!!!");
    }
  }
}

function Activator<T>(type: {new(): T}) : T {
  return new type();
}

import Api = Client.Common.Api;

window.onload = () => {
  var m = new Views.Main();
  m.render();
  $("#body").replaceWith(m.$el);

  Promise.all([
    Api.users.initialize(),
    Api.apps.initialize()
  ])
  .then(vals => {
    console.log(Api.apps.all().length);
    console.log(Api.users.all().length);
  });
};
