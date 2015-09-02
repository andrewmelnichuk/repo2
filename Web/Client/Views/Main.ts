///<reference path="../_references.ts"/>
///<reference path="TextBox.ts"/>

module Views {

  export class Main extends ViewBase {
    
    private _tbName: TextBox = new TextBox(this);
    
    public render() {
      super.render();
      this.$el.html("hello world");
      this.$el.append("<input type='button' value='Refresh'>");
      //this.$el.append(this._tbName.$el);
    }
    
    public events(): Array<IViewEvent> {
      return [
        {event: "click", selector: "", handler: this.onClick}
      ];
    }
    
    private onClick() {
      Data.users.refresh();
    }
  }
}

function Activator<T>(type: {new(): T}) : T {
  return new type();
}

import Data = Client.Common.Data;
import User = Client.Models.User;

window.onload = () => {
  var m = new Views.Main();
  m.render();
  $("#body").replaceWith(m.$el);

  console.log(Data);

  Promise.all([
    Data.users.initialize(),
    Data.apps.initialize()
  ])
  .then(vals => {
    console.log(Data.apps.all().length);
    console.log(Data.users.all().length);
  });
};
