module Client.Views.Manage {
  
  import EventMgr = Client.Events.EventManager;

  export class NavView extends Client.Views.ViewBase {

    public render() {
      this.$el.html(this.template);
      return this;
    }

    protected viewEvents() {
      return {
        "click a[data-menu-item]": this.menuItemClick
      }
    }

    private menuItemClick(event: JQueryEventObject) {
      var menuItem = $(event.target).attr("data-menu-item");
      EventMgr.raise("ui.views.manage.nav", "change", menuItem);
    }

    private template: string = `
      <ul class="nav nav-pills nav-stacked">
        <li role="presentation"><a href="#" data-menu-item="apps">Applications</a></li>
        <li role="presentation"><a href="#" data-menu-item="nets">Networks</a></li>
        <li role="presentation"><a href="#" data-menu-item="servers">Servers</a></li>
        <li role="presentation"><a href="#" data-menu-item="clusters">Clusters</a></li>
      </ul>
    `;
  }
}