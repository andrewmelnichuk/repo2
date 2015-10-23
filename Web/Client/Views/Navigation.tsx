///<reference path="../_references.ts" />

module Client.Views {

  export class Navigation extends React.Component<any, any> {

    public render() {
      return (
        <nav className="navbar navbar-default navbar-static-top" role="navigation" style={{marginBottom: 0}}>
          {this.props["children"]}
        </nav>
      );
    }
  }
}