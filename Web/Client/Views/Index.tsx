///<reference path="../_references.ts" />

module Client.Views {

  import Dictionary = Client.Common.Dictionary;
  import EventMgr = Client.Events.EventManager;

  export class Index extends React.Component<any, {activeItem: MainMenuItem}> {

    private activeItem = MainMenuItem.Explore;

    private contentViews = new Dictionary<MainMenuItem, JSX.Element>()
      .add(MainMenuItem.Explore, <ExplorerView />)
      .add(MainMenuItem.Manage, <ManageView />);

    private mainMenuChanged(item: MainMenuItem) {
      this.setState({activeItem: item});
    }
    
    public constructor() {
      super();
      this.state = {activeItem: this.activeItem};
    }
    
    public render() {
      return (
        <div>
          <ScreenSaver />
          <ModalBox/>
          <Header/>
          <div id="main" className="container-fluid">
            <div className="row">
              <div id="sidebar-left" className="col-xs-2 col-sm-2">
                <MainMenu activeItem={MainMenuItem.Explore} onChanged={this.mainMenuChanged.bind(this)} />
              </div>
              <div id="content" className="col-xs-12 col-sm-10">
                {this.contentViews.get(this.state.activeItem)}
              </div>  
            </div>
          </div>
        </div>
      );
    }
  }
}


window.onload = () => {
  
  React.render(<Client.Views.Index />, document.getElementById("body"));
  //React.render(<Client.Views.ExplorerView />, document.getElementById("body"));
  
  // React.unmountComponentAtNode(document.body);

  
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