///<reference path="ViewBase.ts"/>

module Views {
  
  export class TextBox extends ViewBase {
    public render() {
      super.render();
      this.$el.html("<input type=\"text\" value=\"asd\"></input>");
    }
  }
  
}