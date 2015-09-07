module Client.Views {

  export class ClustersView extends Client.Views.ViewBase {
    
    protected initialize() {
    }
    
    public render() {
      super.render();
      this.$el.html(`
        <div class="easyui-panel" title="Clusters" style="border-width:0;padding:5px;"">
          <ul class="easyui-tree"></ul>
        </div>
      `);
    }
    
    public postRender() {
      super.postRender();
      this.$el.find(".easyui-panel").panel();
      this.$el.find(".easyui-tree").tree({
        "data": [{
          "id": 1,
          "text": "Production",
          "children": [{
            "id": 11,
            "text": "Total Domination",
            "children": [{
              "id": 111,
              "text": "Manage"
            }, {
              "id": 112,
              "text": "Config"
            }, {
              "id": 113,
              "text": "Logs"
            }, {
              "id": 114,
              "text": "Perf"
            }, {
              "id": 115,
              "text": "Servers"
            }]
          }, {
            "id": 12,
            "text": "Elves"
          }, {
            "id": 13,
            "text": "Pirates"
          }, {
            "id": 14,
            "text": "Sparta"
          }, {
            "id": 15,
            "text": "Nords"
          }]
        }]
      });
    }
  }
}