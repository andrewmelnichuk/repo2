namespace Client.Views {

  export class ExploreView extends React.Component<any, any> {

    public componentDidMount() {
      var node = React.findDOMNode(this.refs["jstree"]);
      $(node).jstree();
      console.log("tree did mount");
    }

    public componentDidUpdate() {
      console.log("componentDidUpdate");
    }

    public shouldComponentUpdate(): boolean {
      console.log("componentShouldUpdate");
      return false;
    }

    public componentWilUnmount() {
      var node = React.findDOMNode(this.refs["jstree"]);
      $(node).jstree("destroy");
    }

    public render() {
      return (
            <div className="row">
              <div className="col-xs-2">
                <ul>
                  <li>Inbox</li>
                  <li>Starred</li>
                  <li>Important</li>
                  <li>Sent Mail</li>
                </ul>
              </div>
              <div className="col-xs-10">
                content   
              </div>
            </div>
      );
    }
  }
}