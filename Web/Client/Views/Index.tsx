///<reference path="../_references.ts" />

module Client.Views {

  import Dictionary = Client.Common.Dictionary;

  export class Index extends React.Component<any, any> {

    private contentViews = new Dictionary<string, JSX.Element>()
      .add("explore", <ExplorerView />)
      .add("manage.apps", <ManageView />);

    private onClick(item: string) {
      if (this.contentViews.containsKey(item))
        this.setState({activeItem: item});
    }

    public constructor() {
      super();
      this.state = {activeItem: "explore"};
    }

    public render() {
      return (
        <div>
          <Navigation>
            <Brand/>
            <TopMenu/>
            <SideMenu onClick={this.onClick.bind(this)}/>
          </Navigation>
          <Content>
            {this.state.activeItem}
          </Content>
        </div>
      );
    }
  }
}

window.onload = () => {
  
  React.render(<Client.Views.Index />, document.getElementById("wrapper"));

  // main.postRender();
// $("#tt").tree();
// $("#grd").datagrid();
  // Promise.all([
  //   Data.users.initialize(),
  //   Data.apps.initialize()
  // ])
  // .then(vals => {
  //   console.log(Data.apps.all().length);
  //   console.log(Data.users.all().length);
  // });
};  