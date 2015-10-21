///<reference path="../_references.ts" />

namespace Client.Views {

  interface Node {
    name: string,
    id: string,
    icon?: string,
    active?: boolean,
    expanded?: boolean,
    className?: string,
    children?: Node[],
  }

  interface MainMenuProps {
    onClick: (nodeId: string) => void;
  }

  export class MainMenu extends React.Component<MainMenuProps, {model:any}> {

    private _nodes: Node[] = [
      {name: "Explore", id: "explore", icon: "fa-search", active: true},
      {name: "Manage", id: "manage", children: [
        {name: "Applications", id: "manage.apps"},
        {name: "Networks", id: "manage.nets"},
        {name: "Clusters", id: "manage.cluster"},
        {name: "Servers", id: "manage.servers", children: [
          {name: "Applications", id: "manage.apps1"},
          {name: "Networks", id: "manage.nets2"},
          {name: "Clusters", id: "manage.cluster3"},
          {name: "Servers", id: "manage.servers4"},
        ]},
      ]},
      {name: "Users", id: "users"},
    ];

    public constructor(props: MainMenuProps) {
      super(props);
      this.state = this.getState();
    }

    public render() {
      return (
        <ul className="nav main-menu">
          {this._nodes.map(node => this.renderNode(node))}
        </ul>
      );
    }

    private renderNode(node: Node) {
      var hasChildren = (node.children && node.children.length > 0);

      var liClasses = hasChildren ? "dropdown" : null;
      var aClasses = window.classNames("ajax-link", {
          "dropdown-toggle": hasChildren,
          "active-parent": node.active || node.expanded,
          "active": node.active || node.expanded
      });
      var iconClasses = window.classNames("fa", node.icon, {
        "fa-angle-right": !node.icon
      });

      var children = hasChildren 
        ? <ul className="dropdown-menu" style={node.expanded ? {display:"block"} : null}>
            {node.children.map(n => this.renderNode(n))}
          </ul> 
        : null; 

      return (
        <li key={node.id} className={liClasses}>
          <a href="#" className={aClasses} onClick={this.onClick.bind(this, node.id)}>
            <i className={iconClasses}></i>
            <span className="hidden-xs">{node.name}</span>
          </a>
          {children}
        </li>
      );
    }

    private onClick(id: string) {
      this.traverseNodes((node, path) => {
        if (node.id == id) {
          node.active = true;
          node.expanded = (node.children && node.children.length > 0) 
            ? !(node.expanded || false)
            : false;
          path.forEach(n => n.expanded = true); // expand all parent nodes
        }
        else {
          node.active = false;
          node.expanded = false;
        }
      });

      this.setState(this.getState());

      if (this.props.onClick)
        this.props.onClick(id);
    }

    private traverseNodes(fn: (node: Node, path: Node[]) => void)
    {
      var iterate = (nodes: Node[], path: Node[]) => {
        if (!nodes) return;
        nodes.forEach(n => {
          fn(n, path);
          path.push(n);
          iterate(n.children, path);
          path.splice(path.length - 1, 1);
        })
      };
      iterate(this._nodes, []);
    }
    
    private getState() {
      return {model: $.extend(true, {}, this._nodes)}; // clone model
    }
  }
}

        {/*
        <ul className="nav main-menu">
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
        </ul>
       */}
