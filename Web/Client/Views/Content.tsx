///<reference path="../_references.ts" />

namespace Client.Views {

  export class Content extends React.Component<any, any> {
    
    public componentWillMount() {
      window.addEventListener("load", this.updateHeight);
      window.addEventListener("resize", this.updateHeight);
    }
    
    public componentDidMount() {
      this.updateHeight();
    }
    
    public componentUnmount() {
      window.removeEventListener("load", this.updateHeight);
      window.removeEventListener("resize", this.updateHeight);
    }

    public render() {
      return (
        <div id="page-wrapper">
          {this.props["children"]}
        </div>
      );
    }

    private updateHeight() {
      var topOffset = 50;
      var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
      if (width < 768) {
          $('div.navbar-collapse').addClass('collapse');
          topOffset = 100; // 2-row-menu
      } else {
          $('div.navbar-collapse').removeClass('collapse');
      }
  
      var height = ((window.innerHeight > 0) ? window.innerHeight : screen.height) - 1;
      height = height - topOffset;
      if (height < 1) height = 1;
      if (height > topOffset) {
          $("#page-wrapper").css("min-height", (height) + "px");
      }
    }
  }
}