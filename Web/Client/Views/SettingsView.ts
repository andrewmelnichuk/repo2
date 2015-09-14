module Client.Views {

  export class SettingsView extends Client.Views.ViewBase {

    protected initialize() {
    }

    public render() {
      super.render();
      this.$el.html(this.template);
      return this;
    }

    private template: string = `Settings view`;
  }
}