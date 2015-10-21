///<reference path="../_references.ts" />

module Client.Views {

  export class ScreenSaver extends React.Component<any, any> {

    public render() {
      return (
        <div id="screensaver">
          <canvas id="canvas"></canvas>
          <i className="fa fa-lock" id="screen_unlock"></i>
        </div>
      );
    }
  }
}