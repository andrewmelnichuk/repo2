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
        <div ref="jstree">
          <ul>
            <li>Production
              <ul>
                <li>Total Domination
                  <ul>
                    <li>Manage</li>
                    <li>Configs</li>
                    <li>Logs</li>
                    <li>Perfs</li>
                    <li>Servers</li>
                  </ul>
                </li>
                <li>Sparta</li>
                <li>Pirates</li>
                <li>Elves</li>
                <li>Nords</li>
              </ul>
            </li>
            <li>Supertest
              <ul>
                <li>Total Domination</li>
              </ul>
            </li>
          </ul>
        </div>
      );
    }
  }
}