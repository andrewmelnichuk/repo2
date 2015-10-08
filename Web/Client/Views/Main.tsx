///<reference path="../_references.ts" />

module Client.Views {

  import Dictionary = Client.Common.Dictionary;
  import EventMgr = Client.Events.EventManager;

  export class Main extends ViewBase {

    private _vwTopNav = new TopNav(this);
    private _vmContent: ViewBase;

    private viewCreators = new Dictionary<string, (parent: ViewBase) => ViewBase>({
      "explore": parent => new ExplorerView(parent),
      "manage": parent => new Client.Views.Manage.ManageView(parent),
      "settings": parent => new SettingsView(parent)
    });

    public render() {
      this.$el.html(`
        <div class="container">
          <div class="top-nav"></div>
          <div class="content"></div>
        </div>
      `);
      this.$el.find(".container .top-nav").append(this._vwTopNav.render().$el);
      return this;
    }

    protected mgrEvents() {
      return {
        "change ui.views.top-nav": this.setContentView
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

  export class Main1 extends React.Component<any, any> {

    // private _vmContent: ViewBase;

    // private viewCreators = new Dictionary<string, (parent: ViewBase) => ViewBase>({
    //   "explore": parent => new ExplorerView(parent),
    //   "manage": parent => new Client.Views.Manage.ManageView(parent),
    //   "settings": parent => new SettingsView(parent)
    // });

    private topNavChanged(item: MenuItem) {
      console.log(item);
    }

    public render() {
      return (
        <div className="container">
          <div className="top-nav">
            <TopNav1 activeItem={MenuItem.Explore} onChanged={this.topNavChanged} />
          </div>
          <div className="content"></div>
        </div>
      );
    }

    // protected mgrEvents() {
    //   return {
    //     "change ui.views.top-nav": this.setContentView
    //   };
    // }
    
    // private setContentView(menuItem: string) {
    //   if (!this.viewCreators.containsKey(menuItem))
    //     throw new Error(`Unknown menu item '${menuItem}'.`);
        
    //   if (this._vmContent)
    //     this._vmContent.destroy();
    //   this._vmContent = this.viewCreators.get(menuItem)(this);
    //   this.$el.find(".content").append(this._vmContent.render().$el);
    // }
  }
}

import User = Client.Models.User;
import TopNav = Client.Views.TopNav1;
import ExplorerView = Client.Views.ExplorerView1;

window.onload = () => {
  // var main = new Client.Views.Main();
  // $("body").append(main.render().$el);
  
  
  var view = <Client.Views.Main1 />;
  React.render(view, document.body);
  
  // React.unmountComponentAtNode(document.body);
  
  
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