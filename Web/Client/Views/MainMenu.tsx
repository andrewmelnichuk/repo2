///<reference path="../_references.ts" />

module Client.Views {

  export enum MainMenuItem {
    Explore, 
    Manage
  };

  export class MainMenuProps {
    activeItem: MainMenuItem;
    onChanged: (item: MainMenuItem) => void;
  };
  
  class MenuItemProps {
    active: boolean;
    onClick: (item: MainMenuItem) => void;
  };

  interface MenuProps {
    className?: string;
  }
  
  class Menu extends React.Component<MenuProps, any> {
    
    public constructor(props: MenuProps) {
      super(props);
    }
    
    public render() {
      return (
        <ul className={this.props.className}>
          {this.props["children"]}
        </ul>
      );
    }
  }

  interface MenuItemProps2 {
    id: string;
    caption: string;
    icon?:string;
    expanded?: boolean;
    active?: boolean;
    onClick?: () => void;
  }

  class MenuItem extends React.Component<MenuItemProps2, any> {
    
    public constructor(props: MenuItemProps2) {
      super(props);
    }

    public render() {
      var icon = this.props.icon 
        ? <i className={this.props.icon}></i> 
        : null;

      var children = this.props["children"]
        ? <ul className="dropdown-menu" style={this.props.expanded ? {display:"block"} : null}>
            {this.props["children"]}
          </ul>
        : null;

      var aClasses = window.classNames(
        "ajax-link", {
        "active-parent active": this.props.active || this.props.expanded
      });
      
      var liClasses = window.classNames(
        {"dropdown": this.props["children"]}
      );

      return (
        <li className={liClasses}>
          <a className={aClasses} onClick={() => this.onClick()}>
            {icon}
            <span className="hidden-xs">{this.props.caption}</span>
          </a>
          {children}
        </li>
      );
    }
    
    private onClick() {
      if (this.props.onClick)
        this.props.onClick();
    }
  }
  
  export class MainMenu extends React.Component<MainMenuProps, {active: MainMenuItem}> {

    private _model = {
      "explore": {caption: "Explore"},
      "manage": {caption: "Manage", children: [{
        "manage.apps": {caption: "Applications"}
      }]},
      "users": {caption: "Users"}
    };

    public constructor(props: MainMenuProps) {
      super(props);
      this.state = {active: MainMenuItem.Explore}
    }

    private setActive(item: MainMenuItem) {
      this.setState({active: item});
      if (this.props.onChanged)
        this.props.onChanged(item);
    }

    private onClick() {
      console.log("clicked");
    }

    public render() {
      var activeIf = (item: MainMenuItem) => this.state.active == item ? "active" : null;

      return (
        <Menu className="nav main-menu">
          <MenuItem caption="Explore" icon="fa fa-pencil-square-o" id="explore" />
          <MenuItem caption="Manage" icon="fa fa-pencil-square-o" id="manage" >
            <MenuItem caption="Applications" id="manage.apps"/>
            <MenuItem caption="Networks" id="manage.nets" />
            <MenuItem caption="Clusters" id="manage.clusters" />
            <MenuItem caption="Servers" id="manage.servers" />
          </MenuItem>
          <MenuItem caption="Users" icon="fa fa-pencil-square-o" id="explore" />
          {/*
          <li className="dropdown">
            <a href="#" className="dropdown-toggle">
              <i className="fa fa-table"></i>
              <span className="hidden-xs">Tables</span>
            </a>
            <ul className="dropdown-menu">
              <li><a className="ajax-link" href="ajax/tables_simple.html">Simple Tables</a></li>
              <li><a className="ajax-link" href="ajax/tables_datatables.html">Data Tables</a></li>
              <li><a className="ajax-link" href="ajax/tables_beauty.html">Beauty Tables</a></li>
            </ul>
          </li>
          <li className="dropdown">
            <a href="#" className="dropdown-toggle">
              <i className="fa fa-pencil-square-o"></i>
              <span className="hidden-xs">Forms</span>
            </a>
            <ul className="dropdown-menu">
              <li><a className="ajax-link" href="ajax/forms_elements.html">Elements</a></li>
              <li><a className="ajax-link" href="ajax/forms_layouts.html">Layouts</a></li>
              <li><a className="ajax-link" href="ajax/forms_file_uploader.html">File Uploader</a></li>
            </ul>
          </li>
          <li className="dropdown">
            <a href="#" className="dropdown-toggle">
              <i className="fa fa-desktop"></i>
              <span className="hidden-xs">UI Elements</span>
            </a>
            <ul className="dropdown-menu">
              <li><a className="ajax-link" href="ajax/ui_grid.html">Grid</a></li>
              <li><a className="ajax-link" href="ajax/ui_buttons.html">Buttons</a></li>
              <li><a className="ajax-link" href="ajax/ui_progressbars.html">Progress Bars</a></li>
              <li><a className="ajax-link" href="ajax/ui_jquery-ui.html">Jquery UI</a></li>
              <li><a className="ajax-link" href="ajax/ui_icons.html">Icons</a></li>
            </ul>
          </li>
          <li className="dropdown">
            <a href="#" className="dropdown-toggle">
              <i className="fa fa-list"></i>
              <span className="hidden-xs">Pages</span>
            </a>
            <ul className="dropdown-menu">
              <li><a href="ajax/page_login.html">Login</a></li>
              <li><a href="ajax/page_register.html">Register</a></li>
              <li><a id="locked-screen" className="submenu" href="ajax/page_locked.html">Locked Screen</a></li>
              <li><a className="ajax-link" href="ajax/page_contacts.html">Contacts</a></li>
              <li><a className="ajax-link" href="ajax/page_feed.html">Feed</a></li>
              <li><a className="ajax-link add-full" href="ajax/page_messages.html">Messages</a></li>
              <li><a className="ajax-link" href="ajax/page_pricing.html">Pricing</a></li>
              <li><a className="ajax-link" href="ajax/page_invoice.html">Invoice</a></li>
              <li><a className="ajax-link" href="ajax/page_search.html">Search Results</a></li>
              <li><a className="ajax-link" href="ajax/page_404.html">Error 404</a></li>
              <li><a href="ajax/page_500.html">Error 500</a></li>
            </ul>
          </li>
          <li className="dropdown">
            <a href="#" className="dropdown-toggle">
              <i className="fa fa-map-marker"></i>
              <span className="hidden-xs">Maps</span>
            </a>
            <ul className="dropdown-menu">
              <li><a className="ajax-link" href="ajax/maps.html">OpenStreetMap</a></li>
              <li><a className="ajax-link" href="ajax/map_fullscreen.html">Fullscreen map</a></li>
            </ul>
          </li>
          <li className="dropdown">
            <a href="#" className="dropdown-toggle">
              <i className="fa fa-picture-o"></i>
              <span className="hidden-xs">Gallery</span>
            </a>
            <ul className="dropdown-menu">
              <li><a className="ajax-link" href="ajax/gallery_simple.html">Simple Gallery</a></li>
              <li><a className="ajax-link" href="ajax/gallery_flickr.html">Flickr Gallery</a></li>
            </ul>
          </li>
          <li>
            <a className="ajax-link" href="ajax/typography.html">
              <i className="fa fa-font"></i>
              <span className="hidden-xs">Typography</span>
            </a>
          </li>
          <li>
            <a className="ajax-link" href="ajax/calendar.html">
              <i className="fa fa-calendar"></i>
              <span className="hidden-xs">Calendar</span>
            </a>
          </li>
          <li className="dropdown">
            <a href="#" className="dropdown-toggle">
              <i className="fa fa-picture-o"></i>
              <span className="hidden-xs">Multilevel menu</span>
            </a>
            <ul className="dropdown-menu">
              <li><a href="#">First level menu</a></li>
              <li><a href="#">First level menu</a></li>
              <li className="dropdown">
                <a href="#" className="dropdown-toggle">
                  <i className="fa fa-plus-square"></i>
                  <span className="hidden-xs">Second level menu group</span>
                </a>
                <ul className="dropdown-menu">
                  <li><a href="#">Second level menu</a></li>
                  <li><a href="#">Second level menu</a></li>
                  <li className="dropdown">
                    <a href="#" className="dropdown-toggle">
                      <i className="fa fa-plus-square"></i>
                      <span className="hidden-xs">Three level menu group</span>
                    </a>
                    <ul className="dropdown-menu">
                      <li><a href="#">Three level menu</a></li>
                      <li><a href="#">Three level menu</a></li>
                      <li className="dropdown">
                        <a href="#" className="dropdown-toggle">
                          <i className="fa fa-plus-square"></i>
                          <span className="hidden-xs">Four level menu group</span>
                        </a>
                        <ul className="dropdown-menu">
                          <li><a href="#">Four level menu</a></li>
                          <li><a href="#">Four level menu</a></li>
                          <li className="dropdown">
                            <a href="#" className="dropdown-toggle">
                              <i className="fa fa-plus-square"></i>
                              <span className="hidden-xs">Five level menu group</span>
                            </a>
                            <ul className="dropdown-menu">
                              <li><a href="#">Five level menu</a></li>
                              <li><a href="#">Five level menu</a></li>
                              <li className="dropdown">
                                <a href="#" className="dropdown-toggle">
                                  <i className="fa fa-plus-square"></i>
                                  <span className="hidden-xs">Six level menu group</span>
                                </a>
                                <ul className="dropdown-menu">
                                  <li><a href="#">Six level menu</a></li>
                                  <li><a href="#">Six level menu</a></li>
                                </ul>
                              </li>
                            </ul>
                          </li>
                        </ul>
                      </li>
                      <li><a href="#">Three level menu</a></li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          */}
        </Menu>
      );
    }
  }
}