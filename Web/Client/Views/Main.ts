///<reference path="../_references.ts"/>
///<reference path="TextBox.ts"/>

module Client.Views {

  export class Main extends ViewBase {

    private _vwClusters = new ClustersView(this);

    public render() {
      super.render();
      this.$el.html(template);
      this.$el.find(".west").append(this._vwClusters.$el);
    }

    public postRender() {
      super.postRender();
      this.$el.find(".easyui-layout").layout();
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
  var main = new Client.Views.Main();
  main.render();
  $("body").append(main.$el);
  main.postRender();
  
  // $(".easyui-layout .easyui-panel").panel();
  // $(".easyui-layout .easyui-tree").tree({
  //   "data": [{
  //     "id": 1,
  //     "text": "Production",
  //     "children": [{
  //       "id": 11,
  //       "text": "Total Domination",
  //       "children": [{
  //         "id": 111,
  //         "text": "Manage"
  //       }, {
  //         "id": 112,
  //         "text": "Config"
  //       }, {
  //         "id": 113,
  //         "text": "Logs"
  //       }, {
  //         "id": 114,
  //         "text": "Perf"
  //       }, {
  //         "id": 115,
  //         "text": "Servers"
  //       }]
  //     }, {
  //       "id": 12,
  //       "text": "Elves"
  //     }, {
  //       "id": 13,
  //       "text": "Pirates"
  //     }, {
  //       "id": 14,
  //       "text": "Sparta"
  //     }, {
  //       "id": 15,
  //       "text": "Nords"
  //     }]
  //   }]
  // });

  console.log(Data);

  // Promise.all([
  //   Data.users.initialize(),
  //   Data.apps.initialize()
  // ])
  // .then(vals => {
  //   console.log(Data.apps.all().length);
  //   console.log(Data.users.all().length);
  // });
};

var template: string = `
  <div class="easyui-layout" style="height:100%;">
    <div data-options="region:'south',split:true" style="height:50px;">
    </div>
    <div data-options="region:'west',split:true" class="west" style="width:300px;">
    </div>
    <div class="center" data-options="region:'center',title:''"></div>
  </div>
`;