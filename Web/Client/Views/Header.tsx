///<reference path="../_references.ts" />

module Client.Views {

  export class Header extends React.Component<any, any> {

    public render() {
      return (
        <header className="navbar">
          <div className="container-fluid expanded-panel">
            <div className="row">
              <div id="logo" className="col-xs-12 col-sm-2">
                <a href="index.html">Plarium</a>
              </div>
              <div id="top-panel" className="col-xs-12 col-sm-10">
                <div className="row">
                  <div className="col-xs-8 col-sm-4">
                    <a href="#" className="show-sidebar">
                      <i className="fa fa-bars"></i>
                    </a>
                    <div id="search">
                      <input type="text" placeholder="search"/>
                      <i className="fa fa-search"></i>
                    </div>
                  </div>
                  <div className="col-xs-4 col-sm-8 top-panel-right">
                    <ul className="nav navbar-nav pull-right panel-menu">
                      <li className="hidden-xs">
                        <a href="index.html" className="modal-link">
                          <i className="fa fa-bell"></i>
                          <span className="badge">7</span>
                        </a>
                      </li>
                      <li className="hidden-xs">
                        <a className="ajax-link" href="ajax/calendar.html">
                          <i className="fa fa-calendar"></i>
                          <span className="badge">7</span>
                        </a>
                      </li>
                      <li className="hidden-xs">
                        <a href="ajax/page_messages.html" className="ajax-link">
                          <i className="fa fa-envelope"></i>
                          <span className="badge">7</span>
                        </a>
                      </li>
                      <li className="dropdown">
                        <a href="#" className="dropdown-toggle account" data-toggle="dropdown">
                          <div className="avatar">
                            <img src="img/avatar.jpg" className="img-rounded" alt="avatar" />
                          </div>
                          <i className="fa fa-angle-down pull-right"></i>
                          <div className="user-mini pull-right">
                            <span className="welcome">Welcome,</span>
                            <span>Jane Devoops</span>
                          </div>
                        </a>
                        <ul className="dropdown-menu">
                          <li>
                            <a href="#">
                              <i className="fa fa-user"></i>
                              <span>Profile</span>
                            </a>
                          </li>
                          <li>
                            <a href="ajax/page_messages.html" className="ajax-link">
                              <i className="fa fa-envelope"></i>
                              <span>Messages</span>
                            </a>
                          </li>
                          <li>
                            <a href="ajax/gallery_simple.html" className="ajax-link">
                              <i className="fa fa-picture-o"></i>
                              <span>Albums</span>
                            </a>
                          </li>
                          <li>
                            <a href="ajax/calendar.html" className="ajax-link">
                              <i className="fa fa-tasks"></i>
                              <span>Tasks</span>
                            </a>
                          </li>
                          <li>
                            <a href="#">
                              <i className="fa fa-cog"></i>
                              <span>Settings</span>
                            </a>
                          </li>
                          <li>
                            <a href="#">
                              <i className="fa fa-power-off"></i>
                              <span>Logout 1</span>
                            </a>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      );
    }
  }
}