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

    public componentDidUpdate() {
      
    }

    public render() {
      return (
        <div className="navbar-default sidebar" role="navigation">
          <div className="sidebar-nav navbar-collapse">
            <ul className="nav" id="side-menu">
              {this._nodes.map(node => this.renderNode(node))};
            </ul>
          </div>
        </div>
      );
    }

    private renderNode(node: Node) {
      var liClasses = node.expanded ? "expanded" : null;
      var iconClasses = window.classNames("fa", node.icon, "fa-fw");
      var ulClasses = window.classNames("nav", "nav-second-level", "collapse", {"in": node.expanded});

      var hasChildren = (node.children && node.children.length > 0); 
      var children = hasChildren
        ? <ul className={ulClasses}>
            {node.children.map(n => this.renderNode(n))}
          </ul> 
        : null;
      var childrenIcon = hasChildren
        ? <span className="fa arrow"></span>
        : null;

      return (
        <li key={node.id} className={liClasses}>
          <a href="#" onClick={this.onClick.bind(this, node.id)}>
            <i className={iconClasses}></i> {node.name} {childrenIcon}
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