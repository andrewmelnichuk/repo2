module Client.Views.Manage {

  export class ManageView extends Client.Views.ViewBase {

    private _sideNav = new NavView(this);

    public render() {
      super.render();
      this.$el.html(this.template);
      this.$el.find(".side-nav").append(this._sideNav.render().$el);
      return this;
    }

    protected mgrEvents() {
      return {
        "change ui.views.manage.nav": this.setContentView
      }
    }

    private setContentView(menuItem: string) {
      this.$el.find(".content").html(menuItem);
    }

    private template: string = `
      <div class="row">
        <div class="col-md-3 side-nav">
        </div>
        <div class="col-md-9 content">
          Content
        </div>
      </div>
    `;
  }
}