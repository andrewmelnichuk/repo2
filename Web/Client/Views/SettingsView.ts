module Client.Views {

  export class SettingsView extends Client.Views.ViewBase {

    protected initialize() {
    }

    public render() {
      super.render();
      this.$el.html(this.template);
    }

    private template: string = `Settings view`;
  }
}