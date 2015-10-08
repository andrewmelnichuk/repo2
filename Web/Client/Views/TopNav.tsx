///<reference path="../_references.ts" />

namespace Client.Views {

  export enum MenuItem {
    Explore, 
    Manage, 
    UserSettings, 
    UserLogout
  };

  export class TopNavProps {
    activeItem: MenuItem;
    onChanged: (item:MenuItem) => void;
  }

  export class TopNav1 extends React.Component<TopNavProps, {active: MenuItem}> 
  {
    private setActive(item: MenuItem) {
      this.setState({active: item});
      if (this.props.onChanged)
        this.props.onChanged(item);
    }

    public constructor(props: TopNavProps) {
      super(props);
      this.state = {active: this.props.activeItem};
    }

    public render() {
      var activeIf = (item: MenuItem) => this.state.active == item ? "active" : null;

      return (
        <nav className="navbar navbar-default">
          <div className="container-fluid">

            {/* Brand and toggle get grouped for better mobile display */} 
            <div className="navbar-header">
              <a className="navbar-brand" href="#">Plarium</a>
            </div>

            {/* Collect the nav links, forms, and other content for toggling */}
            <ul className="nav navbar-nav">
              <li className={activeIf(MenuItem.Explore)}>
                <a href="#" onClick={() => this.setActive(MenuItem.Explore)}>Explore</a>
              </li>
              <li className={activeIf(MenuItem.Manage)}>
                <a href="#" onClick={() => this.setActive(MenuItem.Manage)}>Manage</a>
              </li>
            </ul>
            <ul className="nav navbar-nav navbar-right">
              <li className="dropdown">
                <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Username <span className="caret"></span></a>
                <ul className="dropdown-menu">
                  <li className={activeIf(MenuItem.UserSettings)}>
                    <a href="#" onClick={() => this.setActive(MenuItem.UserSettings)}>Settings</a>
                  </li>
                  <li className={activeIf(MenuItem.UserLogout)}>
                    <a href="#" onClick={() => this.setActive(MenuItem.UserLogout)}>Logout</a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </nav>
      );
    }
  }
}