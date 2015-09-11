///<reference path="../Common/Dictionary.ts"/>

module Client.Views {

  import Dictionary = Client.Common.Dictionary;
  import EventBus = Client.Events.EventBus;

  export class Main extends ViewBase {

    private _vwTopNav = new TopNav(this);
    private _vmContent: ViewBase;

    private viewCreators = new Dictionary<string, (parent: ViewBase) => ViewBase>();

    constructor() {
      super();
      this.viewCreators.add("explore", parent => new ExplorerView(parent));
      this.viewCreators.add("manage", parent => new ManageView(parent));
      this.viewCreators.add("settings", parent => new SettingsView(parent));
    }
    
    public render() {
      super.render();
      this.$el.html(`
        <div class="container">
          <div class="topnav"></div>
          <div class="content"></div>
        </div>
      `);
      this.$el.find(".container .topnav").append(this._vwTopNav.$el);
    }

    public initialize() {
      EventBus.on("ui.views.top-nav.menu-item", "change", this, this.setContentView);
    }
    
    private setContentView(menuItem: string) {
      if (!this.viewCreators.containsKey(menuItem))
        throw new Error(`Unknown menu item '${menuItem}'`);
        
      if (this._vmContent)
        this._vmContent.destroy();
      this._vmContent = this.viewCreators.get(menuItem)(this);
      this._vmContent.render();
      this.$el.find(".content").append(this._vmContent.$el);
    }
  }
}

import Data = Client.Common.Data;
import User = Client.Models.User;

window.onload = () => {
  var main = new Client.Views.Main();
  main.render();
  $("body").append(main.$el);
  
  //console.log(new A().f == new A().f);
  
  // main.postRender();
// $("#tt").tree();
// $("#grd").datagrid();
  // Promise.all([
  //   Data.users.initialize(),
  //   Data.apps.initialize()
  // ])
  // .then(vals => {
  //   console.log(Data.apps.all().length);
  //   console.log(Data.users.all().length);
  // });
};