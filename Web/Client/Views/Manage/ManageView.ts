module Client.Views.Manage {

  export class ManageView extends Client.Views.ViewBase {

    public render() {
      super.render();
      this.$el.html(this.template);
      return this;
    }

    private template: string = `
      <div class="row">
        <div class="col-md-3">
          <ul class="nav nav-pills nav-stacked">
            <li role="presentation"><a href="#">Applications</a></li>
            <li role="presentation"><a href="#">Networks</a></li>
            <li role="presentation"><a href="#">Servers</a></li>
            <li role="presentation"><a href="#">Clusters</a></li>
          </ul>
        </div>
        <div class="col-md-9">
          Content
        </div>
      </div>
    `;
  }
}