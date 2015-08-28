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

window.onload = () => {
  var m = new Views.Main();
  m.render();
  $("#body").replaceWith(m.$el);

  Client.Common.Api.Users.get(1)
    .then(u => console.log(u));

  // new Client.Commands.SyncCmd(201)
  //   .done(() => console.log('sync done'))
  //   .fail(() => console.log('sync fail'))
  //   .always(() => console.log('sync always'))
  //   .execute();
};
