module Client.Views {

  export class ExplorerView extends Client.Views.ViewBase {

    protected initialize() {
    }

    public render() {
      super.render();
      this.$el.html(this.template);
      this.$el.find("#jstree").jstree();
    }

    private template: string = `
      <div class="row">
        <div class="col-md-3" style="border: 0px solid red">
          <div class="panel panel-default">
            <div class="panel-heading">
              <h3 class="panel-title">Games</h3>
            </div>
            <div class="panel-body" style="padding:10px;">
              <div id="jstree">
                <ul>
                  <li>Production
                    <ul>
                      <li>Total Domination
                        <ul>
                          <li>Manage</li>
                          <li>Configs</li>
                          <li>Logs</li>
                          <li>Perfs</li>
                          <li>Servers</li>
                        </ul>
                      </li>
                      <li>Sparta</li>
                      <li>Pirates</li>
                      <li>Elves</li>
                      <li>Nords</li>
                    </ul>
                  </li>
                  <li>Supertest
                    <ul>
                      <li>Total Domination</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-9" style="border: 1px solid red">
          <h1>Title</h1>
        </div>
      </div>
    `;
  }
}