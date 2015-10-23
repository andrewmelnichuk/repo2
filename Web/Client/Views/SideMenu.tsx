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

  export class SideMenu extends React.Component<MainMenuProps, {model:any}> {

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

    public componentDidMount() {
      var node = React.findDOMNode(this.refs["side-menu"]);
      $(node).metisMenu();
    }

    public render() {
      return (
        <div className="navbar-default sidebar" role="navigation">
            <div className="sidebar-nav navbar-collapse">
                <ul className="nav" id="side-menu" ref="side-menu">
                    <li>
                        <a href="index.html"><i className="fa fa-dashboard fa-fw"></i> Dashboard</a>
                    </li>
                    <li>
                        <a href="#"><i className="fa fa-bar-chart-o fa-fw"></i> Charts<span className="fa arrow"></span></a>
                        <ul className="nav nav-second-level">
                            <li>
                                <a href="flot.html">Flot Charts</a>
                            </li>
                            <li>
                                <a href="morris.html">Morris.js Charts</a>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <a href="tables.html"><i className="fa fa-table fa-fw"></i> Tables</a>
                    </li>
                    <li>
                        <a href="forms.html"><i className="fa fa-edit fa-fw"></i> Forms</a>
                    </li>
                    <li>
                        <a href="#"><i className="fa fa-wrench fa-fw"></i> UI Elements<span className="fa arrow"></span></a>
                        <ul className="nav nav-second-level">
                            <li>
                                <a href="panels-wells.html">Panels and Wells</a>
                            </li>
                            <li>
                                <a href="buttons.html">Buttons</a>
                            </li>
                            <li>
                                <a href="notifications.html">Notifications</a>
                            </li>
                            <li>
                                <a href="typography.html">Typography</a>
                            </li>
                            <li>
                                <a href="icons.html"> Icons</a>
                            </li>
                            <li>
                                <a href="grid.html">Grid</a>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <a href="#"><i className="fa fa-sitemap fa-fw"></i> Multi-Level Dropdown<span className="fa arrow"></span></a>
                        <ul className="nav nav-second-level">
                            <li>
                                <a href="#">Second Level Item</a>
                            </li>
                            <li>
                                <a href="#">Second Level Item</a>
                            </li>
                            <li>
                                <a href="#">Third Level <span className="fa arrow"></span></a>
                                <ul className="nav nav-third-level">
                                    <li>
                                        <a href="#">Third Level Item</a>
                                    </li>
                                    <li>
                                        <a href="#">Third Level Item</a>
                                    </li>
                                    <li>
                                        <a href="#">Third Level Item</a>
                                    </li>
                                    <li>
                                        <a href="#">Third Level Item</a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <a href="#"><i className="fa fa-files-o fa-fw"></i> Sample Pages<span className="fa arrow"></span></a>
                        <ul className="nav nav-second-level">
                            <li>
                                <a href="blank.html">Blank Page</a>
                            </li>
                            <li>
                                <a href="login.html">Login Page</a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
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