///<reference path="../_references.ts"/>
///<reference path="TextBox.ts"/>

module Views {

  export class Main extends ViewBase {
    
    private _tbName: TextBox = new TextBox(this);
    
    public render() {
      super.render();
      this.$el.html(template);
    }
    
    public events(): Array<IViewEvent> {
      return [
        // {event: "click", selector: ".refresh", handler: this.onRefreshClick},
        // {event: "click", selector: ".delete", handler: this.onDeleteClick}
      ];
    }
    
    private onRefreshClick() {
      Data.users.refresh();
    }

    private onDeleteClick() {
      Data.users.delete(this.$el.find(".id").val());
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
  $("body").replaceWith(template);
  $(".easyui-layout").layout();
   $(".easyui-layout .easyui-panel").panel();

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

var template: string = `
  <div class="easyui-layout" style="height:100%;">
    <div data-options="region:'south',split:true" style="height:50px;">
    </div>
    <div data-options="region:'west',split:true" style="width:300px;">
      <div class="easyui-panel" title="Clusters" style="border-width:0;height:100%"">
      tree
      </div>
    </div>
    <div data-options="region:'center',title:''"></div>
  </div>
`;