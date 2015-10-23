///<reference path="../_references.ts" />

namespace Client.Views {

  export class Content extends React.Component<any, any> {

    public render() {
      return (
        <div id="page-wrapper">
          {this.props["children"]}
        </div>
      );
    }
  }
}