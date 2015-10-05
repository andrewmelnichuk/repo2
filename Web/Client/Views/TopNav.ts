///<reference path="../_references.ts" />

module Client.Views {

  import EventMgr = Client.Events.EventManager;

  export class TopNav extends ViewBase {

    private $activeMenuItem: JQuery;

    public render() {
      super.render();
      this.$el.html(this.template);
      return this;
    }

    protected viewEvents() {
      return {
        "click a[data-menu-item]": this.menuItemClick,
      };
    }

    private menuItemClick(event: JQueryEventObject) {
      var menuItem = $(event.target).attr("data-menu-item");
      this.setActiveMenuItem(menuItem);
      EventMgr.raise("ui.views.top-nav", "change", menuItem);
    }

    private setActiveMenuItem(item: string) {
      if (this.$activeMenuItem)
        this.$activeMenuItem.parent("li").removeClass("active");
      this.$activeMenuItem = this.$el.find(`a[data-menu-item='${item}']`);
      if (this.$activeMenuItem)
        this.$activeMenuItem.parent("li").addClass("active");
    }

    private template: string = `
      <nav class="navbar navbar-default">
        <div class="container-fluid">

          <!-- Brand and toggle get grouped for better mobile display -->
          <div class="navbar-header">
            <a class="navbar-brand" href="#">Plarium</a>
          </div>
      
          <!-- Collect the nav links, forms, and other content for toggling -->
          <ul class="nav navbar-nav">
            <li><a href="#" data-menu-item="explore">Explore <span class="sr-only">(current)</span></a></li>
            <li><a href="#" data-menu-item="manage">Manage</a></li>
          </ul>
          <ul class="nav navbar-nav navbar-right">
            <li class="dropdown">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Username <span class="caret"></span></a>
              <ul class="dropdown-menu">
                <li><a href="#" data-menu-item="settings">Settings</a></li>
                <li><a href="#" data-menu-item="logout">Logout</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    `;
  }
}