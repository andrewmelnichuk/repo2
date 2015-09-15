///<reference path="../Common/Dictionary.ts"/>

module Client.Views {

  import Dictionary = Client.Common.Dictionary;
  import EventMgr = Client.Events.EventManager;

  export class Main extends ViewBase {

    private _vwTopNav = new TopNav(this);
    private _vmContent: ViewBase;

    private viewCreators = new Dictionary<string, (parent: ViewBase) => ViewBase>({
      "explore": parent => new ExplorerView(parent),
      "manage": parent => new ManageView(parent),
      "settings": parent => new SettingsView(parent)
    });

    public render() {
      this.$el.html(`
        <div class="container">
          <div class="topnav"></div>
          <div class="content"></div>
        </div>
      `);
      this.$el.find(".container .topnav").append(this._vwTopNav.render().$el);
      return this;
    }

    protected mgrEvents() {
      return {
        "change ui.views.top-nav.menu-item": this.setContentView
      };
    }
    
    private setContentView(menuItem: string) {
      if (!this.viewCreators.containsKey(menuItem))
        throw new Error(`Unknown menu item '${menuItem}'.`);
        
      if (this._vmContent)
        this._vmContent.destroy();
      this._vmContent = this.viewCreators.get(menuItem)(this);
      this.$el.find(".content").append(this._vmContent.render().$el);
    }
  }
}

import Data = Client.Common.Data;
import User = Client.Models.User;

window.onload = () => {
  var main = new Client.Views.Main();
  $("body").append(main.render().$el);
  
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