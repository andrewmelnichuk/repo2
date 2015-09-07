///<reference path="ViewBase.ts"/>

module Client.Views {
  
  export class TextBox extends Client.Views.ViewBase {
    public render() {
      super.render();
      this.$el.html("<input type=\"text\" value=\"asd\"></input>");
      return this;
    }
  }
  
}