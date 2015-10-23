var Config = (function () {
    function Config() {
    }
    Object.defineProperty(Config, "apiUrl", {
        get: function () {
            return this.cfg.apiUrl;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Config, "cfg", {
        get: function () {
            if (window.hasOwnProperty("config"))
                return window["config"];
            throw new Error("Configuration not found. Set window.config object.");
        },
        enumerable: true,
        configurable: true
    });
    return Config;
})();
function model(eventsChannel) {
    return function (target) {
        target["eventsChannel"] = eventsChannel;
        return target;
    };
}
function property(target, property) {
    var value = this[property];
    if (delete this[property]) {
        Object.defineProperty(target, property, {
            get: function () { return value; },
            set: function (newVal) {
                if (value != newVal) {
                    var oldVal = value;
                    value = newVal;
                    var channel = target.constructor["eventsChannel"];
                    Client.Events.EventManager.raise(channel, "change", target, oldVal, newVal);
                }
            },
            enumerable: true,
            configurable: true
        });
    }
}
var Url = (function () {
    function Url() {
    }
    Url.api = function (path) {
        return (path.charAt(0) != '/')
            ? Config.apiUrl + '/' + path
            : Config.apiUrl + path;
    };
    return Url;
})();
var Utils = (function () {
    function Utils() {
    }
    Utils.urlEncode = function (data) {
        var result = "";
        var keys = Object.keys(data);
        for (var i = 0; i < keys.length; i++) {
            result += keys[i] + "=" + data[keys[i]];
            if (i < keys.length - 1)
                result += '&';
        }
        return result;
    };
    return Utils;
})();
var Client;
(function (Client) {
    var Common;
    (function (Common) {
        var Dictionary = (function () {
            function Dictionary(init) {
                this._keys = [];
                this._values = [];
                if (!init)
                    return;
                for (var key in init) {
                    if (init.hasOwnProperty(key))
                        this.add(key, init[key]);
                }
            }
            Dictionary.prototype.get = function (key) {
                return this[key.toString()];
            };
            Dictionary.prototype.add = function (key, value) {
                this[key.toString()] = value;
                this._keys.push(key);
                this._values.push(value);
                return this;
            };
            Dictionary.prototype.remove = function (key) {
                var index = this._keys.indexOf(key, 0);
                this._keys.splice(index, 1);
                this._values.splice(index, 1);
                delete this[key.toString()];
            };
            Dictionary.prototype.keys = function () {
                return this._keys;
            };
            Dictionary.prototype.values = function () {
                return this._values;
            };
            Dictionary.prototype.containsKey = function (key) {
                return this[key.toString()];
            };
            return Dictionary;
        })();
        Common.Dictionary = Dictionary;
    })(Common = Client.Common || (Client.Common = {}));
})(Client || (Client = {}));
///<reference path="../Common/Dictionary.ts" />
var Client;
(function (Client) {
    var Events;
    (function (Events) {
        var Dictionary = Client.Common.Dictionary;
        var EventManager = (function () {
            function EventManager() {
            }
            EventManager.on = function (channel, event, scope, callback) {
                if (!this._handlers.containsKey(channel))
                    this._handlers.add(channel, new Dictionary());
                if (!this._handlers.get(channel).containsKey(event))
                    this._handlers.get(channel).add(event, new Array());
                this._handlers.get(channel).get(event).push({ scope: scope, callback: callback });
            };
            EventManager.off = function (channel, event, scope, callback) {
                if (this._handlers.containsKey(channel) && this._handlers.get(channel).containsKey(event)) {
                    var handlers = this._handlers.get(channel).get(event);
                    for (var i = 0; i < handlers.length; i++) {
                        if (handlers[i].scope == scope && handlers[i].callback == callback) {
                            handlers.splice(i, 1);
                            // TODO remove empty events and channels
                            break;
                        }
                    }
                }
            };
            EventManager.raise = function (channel, event) {
                var args = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    args[_i - 2] = arguments[_i];
                }
                var events = this._handlers.get(channel);
                if (!events) {
                    console.log("EventManager: invalid channel '" + channel + "'");
                    return;
                }
                var handlers = events.get(event);
                if (!handlers) {
                    console.log("EventManager: invalid event '" + event + "'");
                    return;
                }
                for (var _a = 0; _a < handlers.length; _a++) {
                    var handler = handlers[_a];
                    (_b = handler.callback).call.apply(_b, [handler.scope].concat(args));
                }
                console.log("EventManager: " + channel + " -> " + event + ", " + handlers.length + " handler(s) called");
                var _b;
            };
            EventManager._handlers = new Dictionary();
            return EventManager;
        })();
        Events.EventManager = EventManager;
    })(Events = Client.Events || (Client.Events = {}));
})(Client || (Client = {}));
var Client;
(function (Client) {
    var Models;
    (function (Models) {
        var Entity = (function () {
            function Entity() {
            }
            return Entity;
        })();
        Models.Entity = Entity;
    })(Models = Client.Models || (Client.Models = {}));
})(Client || (Client = {}));
///<reference path="Entity.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var Client;
(function (Client) {
    var Models;
    (function (Models) {
        var App = (function (_super) {
            __extends(App, _super);
            function App() {
                _super.apply(this, arguments);
            }
            App.fromJson = function (json) {
                var app = new App();
                app.id = json.Id;
                app.revision = json.Revision;
                app.name = json.Name;
                app.code = json.Code;
                app.internalId = json.InternalId;
                return app;
            };
            __decorate([
                property
            ], App.prototype, "name");
            __decorate([
                property
            ], App.prototype, "code");
            __decorate([
                property
            ], App.prototype, "internalId");
            App = __decorate([
                model("models.App")
            ], App);
            return App;
        })(Models.Entity);
        Models.App = App;
    })(Models = Client.Models || (Client.Models = {}));
})(Client || (Client = {}));
///<reference path="Entity.ts"/>
var Client;
(function (Client) {
    var Models;
    (function (Models) {
        var User = (function (_super) {
            __extends(User, _super);
            function User() {
                _super.apply(this, arguments);
            }
            User.fromJson = function (json) {
                var u = new User();
                u.id = json.Id;
                u.revision = json.Revision;
                u.login = json.Login;
                u.password = json.Password;
                u.firstName = json.FirstName;
                u.lastName = json.LastName;
                return u;
            };
            __decorate([
                property
            ], User.prototype, "login");
            __decorate([
                property
            ], User.prototype, "password");
            __decorate([
                property
            ], User.prototype, "firstName");
            __decorate([
                property
            ], User.prototype, "lastName");
            User = __decorate([
                model("models.User")
            ], User);
            return User;
        })(Models.Entity);
        Models.User = User;
    })(Models = Client.Models || (Client.Models = {}));
})(Client || (Client = {}));
///<reference path="../_references.ts" />
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        var ExplorerView = (function (_super) {
            __extends(ExplorerView, _super);
            function ExplorerView() {
                _super.apply(this, arguments);
            }
            ExplorerView.prototype.componentDidMount = function () {
                var node = React.findDOMNode(this.refs["jstree"]);
                $(node).jstree();
            };
            ExplorerView.prototype.componentDidUpdate = function () {
                console.log("componentDidUpdate");
            };
            ExplorerView.prototype.shouldComponentUpdate = function () {
                console.log("componentShouldUpdate");
                return false;
            };
            ExplorerView.prototype.componentWilUnmount = function () {
                var node = React.findDOMNode(this.refs["jstree"]);
                $(node).jstree("destroy");
            };
            ExplorerView.prototype.render = function () {
                return (React.createElement("div", {"ref": "jstree"}, React.createElement("ul", null, React.createElement("li", null, "Production", React.createElement("ul", null, React.createElement("li", null, "Total Domination", React.createElement("ul", null, React.createElement("li", null, "Manage"), React.createElement("li", null, "Configs"), React.createElement("li", null, "Logs"), React.createElement("li", null, "Perfs"), React.createElement("li", null, "Servers"))), React.createElement("li", null, "Sparta"), React.createElement("li", null, "Pirates"), React.createElement("li", null, "Elves"), React.createElement("li", null, "Nords"))), React.createElement("li", null, "Supertest", React.createElement("ul", null, React.createElement("li", null, "Total Domination"))))));
            };
            return ExplorerView;
        })(React.Component);
        Views.ExplorerView = ExplorerView;
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
///<reference path="typings/es6-promise/es6-promise.d.ts"/>
///<reference path="typings/jquery/jquery.d.ts"/>
///<reference path="typings/react/react.d.ts"/>
///<reference path="typings/react/react-global.d.ts"/>
///<reference path="typings/window/window.d.ts"/>
///<reference path="Common/Dictionary.ts"/>
///<reference path="Events/EventManager.ts"/>
///<reference path="Models/App.ts"/>
///<reference path="Models/Entity.ts"/>
///<reference path="Models/User.ts"/>
///<reference path="Views/ExplorerView.tsx"/>
///<reference path="Config.ts"/>
///<reference path="Utils.ts"/>
///<reference path="../Models/User.ts" />
///<reference path="../Models/App.ts" />
///<reference path = "../_references.ts" />
var Client;
(function (Client) {
    var Common;
    (function (Common) {
        var Dictionary = Client.Common.Dictionary;
        var User = Client.Models.User;
        var App = Client.Models.App;
        var EntityRepository = (function () {
            function EntityRepository(path, fromJson) {
                this._revision = 0;
                this._data = new Dictionary();
                this._url = Url.api(path);
                this._fromJson = fromJson;
            }
            EntityRepository.prototype.initialize = function () {
                var _this = this;
                return new Promise(function (resolve, reject) {
                    if (_this._initialized)
                        resolve();
                    else
                        $.getJSON(_this._url)
                            .done(function (data) {
                            _this.updateData(data);
                            _this._initialized = true;
                            resolve();
                        })
                            .fail(reject);
                });
            };
            EntityRepository.prototype.refresh = function () {
                var _this = this;
                this.ensureInitialized();
                return new Promise(function (resolve, reject) {
                    $.getJSON(_this._url + "?rev=" + _this._revision)
                        .done(function (response) {
                        _this.updateData(response);
                        resolve();
                    })
                        .fail(reject);
                });
            };
            EntityRepository.prototype.get = function (id) {
                this.ensureInitialized();
                if (this._data[id])
                    return this._data[id];
                throw new Error("Entity #" + id + " not found");
            };
            EntityRepository.prototype.all = function () {
                this.ensureInitialized();
                return this._data.values();
            };
            EntityRepository.prototype.save = function (entity) {
                var _this = this;
                return new Promise(function (resolve, reject) {
                    var url = _this._url + (entity.id > 0) ? ("/" + entity.id) : "";
                    // $.ajax(url + "?rev=" + this._revision, {
                    //    data: JSON.stringify(entity),
                    //    contentType: "application/json",
                    //    dataType: "JSON",
                    //    method: "POST"})
                    //  .done(response => {
                    //    this.updateData(response.Updates);
                    //    resolve(response.Data);
                    //  })
                    //  .fail(reject);
                });
            };
            EntityRepository.prototype.delete = function (id) {
                return new Promise(function (resolve, reject) {
                    // $.ajax(this._url + "/" + id + "?rev=" + this._revision, { 
                    //    dataType: "JSON", 
                    //    method: "DELETE" })
                    //  .done(response => {
                    //    this.updateData(response.Updates);
                    //    resolve(response.Data);
                    //  })
                    //  .fail(reject);
                });
            };
            EntityRepository.prototype.updateData = function (json) {
                if (!json)
                    return;
                for (var i = 0; i < json.length; i++) {
                    var obj = this._fromJson(json[i]);
                    if (this._data.containsKey(obj.id))
                        this._data[obj.id] = obj;
                    else
                        this._data.add(obj.id, obj);
                    if (obj.revision > this._revision)
                        this._revision = obj.revision;
                }
            };
            EntityRepository.prototype.ensureInitialized = function () {
                if (!this._initialized)
                    throw new Error("Repository was not initialized");
            };
            return EntityRepository;
        })();
        Common.EntityRepository = EntityRepository;
        var Model = (function () {
            function Model() {
            }
            Model.update = function (changes) {
                var entities;
                for (var e in changes) {
                    if (e instanceof User)
                        entities = this.users;
                    else if (e instanceof App)
                        entities = this.apps;
                    if (entities)
                        this.applyUpdate(e, entities);
                    else
                        throw new Error("Can't update model, unknown entity type " + e.constructor.toString());
                }
            };
            Model.applyUpdate = function (entity, entities) {
                var existing;
                for (var e in entities)
                    if (e.id == entity.id) {
                        existing = e;
                        break;
                    }
                if (!existing)
                    entities.push(entity); // add
                else
                    $.extend(true, existing, entity); // update
            };
            Model.users = [];
            Model.apps = [];
            return Model;
        })();
        Common.Model = Model;
        var Data = (function () {
            function Data() {
            }
            Data.users = new EntityRepository("/users", User.fromJson);
            Data.apps = new EntityRepository("/apps", App.fromJson);
            return Data;
        })();
        Common.Data = Data;
    })(Common = Client.Common || (Client.Common = {}));
})(Client || (Client = {}));
var Client;
(function (Client) {
    var Common;
    (function (Common) {
        (function (HttpMethod) {
            HttpMethod[HttpMethod["GET"] = 0] = "GET";
            HttpMethod[HttpMethod["POST"] = 1] = "POST";
        })(Common.HttpMethod || (Common.HttpMethod = {}));
        var HttpMethod = Common.HttpMethod;
        ;
        var HttpClient = (function () {
            function HttpClient(url) {
                this._headers = {};
                this._callbacks = {};
                this._xhr = new XMLHttpRequest();
                if (url)
                    this._url = url;
            }
            HttpClient.prototype.url = function (url) {
                this._url = url;
                return this;
            };
            HttpClient.prototype.query = function (query) {
                this._query = query;
                return this;
            };
            HttpClient.prototype.header = function (name, value) {
                this._headers[name] = value;
                return this;
            };
            HttpClient.prototype.body = function (data) {
                this._body = data;
                return this;
            };
            HttpClient.prototype.method = function (method) {
                this._method = method;
                return this;
            };
            HttpClient.prototype.call2 = function (callback) {
            };
            HttpClient.prototype.call = function (callbacks) {
                var url = this._url;
                if (this._query)
                    url += '?' + this._query;
                var body = (this._method != HttpMethod.GET) ? this._body : undefined;
                // this._xhr.onreadystatechange = (e: ProgressEvent) => {
                //   if (this._xhr.status == 200 && this._xhr.readyState == 4)
                //     callback(this._xhr.responseText);
                // };
                this._xhr.open(HttpMethod[this._method], url, true);
                for (var header in this._headers)
                    this._xhr.setRequestHeader(header, this._headers[header]);
                this._xhr.send(body);
                // TODO add response callback
            };
            return HttpClient;
        })();
        Common.HttpClient = HttpClient;
    })(Common = Client.Common || (Client.Common = {}));
})(Client || (Client = {}));
///<reference path="_references.ts" />
var DemoProps = (function () {
    function DemoProps() {
    }
    return DemoProps;
})();
var UserName = (function (_super) {
    __extends(UserName, _super);
    function UserName() {
        _super.apply(this, arguments);
    }
    UserName.prototype.render = function () {
        return (React.createElement("div", null, this.props.name));
    };
    return UserName;
})(React.Component);
var LikeButtonState = (function () {
    function LikeButtonState() {
    }
    return LikeButtonState;
})();
var LikeButton = (function (_super) {
    __extends(LikeButton, _super);
    function LikeButton() {
        _super.call(this);
        this._state = { liked: { value: false } };
        this.state = { liked: { value: false } };
        console.log("ctor");
    }
    LikeButton.prototype.componentWillMount = function () {
        console.log("componentWillMount");
    };
    LikeButton.prototype.componentDidMount = function () {
        console.log("componentDidMount");
    };
    LikeButton.prototype.componentWillUpdate = function () {
        console.log("componentWillUpdate");
    };
    LikeButton.prototype.componentDidUpdate = function () {
        console.log("componentDidUpdate");
    };
    LikeButton.prototype.componentWillUnmount = function () {
        console.log("componentWillUnmount");
    };
    LikeButton.prototype.buttonClick = function () {
        // this.state.liked.value = !this.state.liked.value;
        // this.forceUpdate();
        this.state.liked.value = !this.state.liked.value;
        this.setState(this.state);
    };
    LikeButton.prototype.render = function () {
        console.log("render");
        var txt = this.state.liked.value ? "Liked" : "Not Liked";
        return (React.createElement("button", {"ref": "btn", "onClick": this.buttonClick.bind(this)}, txt));
    };
    return LikeButton;
})(React.Component);
///<reference path="../_references.ts" />
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        var Brand = (function (_super) {
            __extends(Brand, _super);
            function Brand() {
                _super.apply(this, arguments);
            }
            Brand.prototype.render = function () {
                return (React.createElement("div", {"className": "navbar-header"}, React.createElement("button", {"type": "button", "className": "navbar-toggle", "data-toggle": "collapse", "data-target": ".navbar-collapse"}, React.createElement("span", {"className": "sr-only"}, "Toggle navigation"), React.createElement("span", {"className": "icon-bar"}), React.createElement("span", {"className": "icon-bar"}), React.createElement("span", {"className": "icon-bar"})), React.createElement("a", {"className": "navbar-brand", "href": "index.html"}, "SB Admin v2.0")));
            };
            return Brand;
        })(React.Component);
        Views.Brand = Brand;
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
///<reference path="../_references.ts" />
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        var Content = (function (_super) {
            __extends(Content, _super);
            function Content() {
                _super.apply(this, arguments);
            }
            Content.prototype.render = function () {
                return (React.createElement("div", {"id": "page-wrapper"}, this.props["children"]));
            };
            return Content;
        })(React.Component);
        Views.Content = Content;
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
///<reference path="../_references.ts" />
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        var Dictionary = Client.Common.Dictionary;
        var Index = (function (_super) {
            __extends(Index, _super);
            function Index() {
                _super.call(this);
                this.contentViews = new Dictionary()
                    .add("explore", React.createElement(Views.ExplorerView, null))
                    .add("manage.apps", React.createElement(Views.ManageView, null));
                this.state = { activeItem: "explore" };
            }
            Index.prototype.onClick = function (item) {
                if (this.contentViews.containsKey(item))
                    this.setState({ activeItem: item });
            };
            Index.prototype.render = function () {
                return (React.createElement("div", null, React.createElement(Views.Navigation, null, React.createElement(Views.Brand, null), React.createElement(Views.TopMenu, null), React.createElement(Views.SideMenu, {"onClick": null})), React.createElement(Views.Content, null, "This is content")));
            };
            return Index;
        })(React.Component);
        Views.Index = Index;
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
window.onload = function () {
    React.render(React.createElement(Client.Views.Index, null), document.getElementById("wrapper"));
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
///<reference path="../_references.ts" />
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        var MainMenu = (function (_super) {
            __extends(MainMenu, _super);
            function MainMenu(props) {
                _super.call(this, props);
                this._nodes = [
                    { name: "Explore", id: "explore", icon: "fa-search", active: true },
                    { name: "Manage", id: "manage", children: [
                            { name: "Applications", id: "manage.apps" },
                            { name: "Networks", id: "manage.nets" },
                            { name: "Clusters", id: "manage.cluster" },
                            { name: "Servers", id: "manage.servers", children: [
                                    { name: "Applications", id: "manage.apps1" },
                                    { name: "Networks", id: "manage.nets2" },
                                    { name: "Clusters", id: "manage.cluster3" },
                                    { name: "Servers", id: "manage.servers4" },
                                ] },
                        ] },
                    { name: "Users", id: "users" },
                ];
                this.state = this.getState();
            }
            MainMenu.prototype.render = function () {
                var _this = this;
                return (React.createElement("ul", {"className": "nav main-menu"}, this._nodes.map(function (node) { return _this.renderNode(node); })));
            };
            MainMenu.prototype.renderNode = function (node) {
                var _this = this;
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
                    ? React.createElement("ul", {"className": "dropdown-menu", "style": node.expanded ? { display: "block" } : null}, node.children.map(function (n) { return _this.renderNode(n); }))
                    : null;
                return (React.createElement("li", {"key": node.id, "className": liClasses}, React.createElement("a", {"href": "#", "className": aClasses, "onClick": this.onClick.bind(this, node.id)}, React.createElement("i", {"className": iconClasses}), React.createElement("span", {"className": "hidden-xs"}, node.name)), children));
            };
            MainMenu.prototype.onClick = function (id) {
                this.traverseNodes(function (node, path) {
                    if (node.id == id) {
                        node.active = true;
                        node.expanded = (node.children && node.children.length > 0)
                            ? !(node.expanded || false)
                            : false;
                        path.forEach(function (n) { return n.expanded = true; }); // expand all parent nodes
                    }
                    else {
                        node.active = false;
                        node.expanded = false;
                    }
                });
                this.setState(this.getState());
                if (this.props.onClick)
                    this.props.onClick(id);
            };
            MainMenu.prototype.traverseNodes = function (fn) {
                var iterate = function (nodes, path) {
                    if (!nodes)
                        return;
                    nodes.forEach(function (n) {
                        fn(n, path);
                        path.push(n);
                        iterate(n.children, path);
                        path.splice(path.length - 1, 1);
                    });
                };
                iterate(this._nodes, []);
            };
            MainMenu.prototype.getState = function () {
                return { model: $.extend(true, {}, this._nodes) }; // clone model
            };
            return MainMenu;
        })(React.Component);
        Views.MainMenu = MainMenu;
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
{
}
///<reference path="../_references.ts" />
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        var ManageView = (function (_super) {
            __extends(ManageView, _super);
            function ManageView() {
                _super.apply(this, arguments);
            }
            ManageView.prototype.render = function () {
                return (React.createElement("div", null, React.createElement("div", {"className": "preloader"}, React.createElement("img", {"src": "img/devoops_getdata.gif", "className": "devoops-getdata", "alt": "preloader"})), React.createElement("div", {"id": "ajax-content"}, "This is Manage Apps view")));
            };
            return ManageView;
        })(React.Component);
        Views.ManageView = ManageView;
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
///<reference path="../_references.ts" />
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        var ModalBox = (function (_super) {
            __extends(ModalBox, _super);
            function ModalBox() {
                _super.apply(this, arguments);
            }
            ModalBox.prototype.render = function () {
                return (React.createElement("div", {"id": "modalbox"}, React.createElement("div", {"className": "devoops-modal"}, React.createElement("div", {"className": "devoops-modal-header"}, React.createElement("div", {"className": "modal-header-name"}, React.createElement("span", null, "Basic table")), React.createElement("div", {"className": "box-icons"}, React.createElement("a", {"className": "close-link"}, React.createElement("i", {"className": "fa fa-times"})))), React.createElement("div", {"className": "devoops-modal-inner"}), React.createElement("div", {"className": "devoops-modal-bottom"}))));
            };
            return ModalBox;
        })(React.Component);
        Views.ModalBox = ModalBox;
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
///<reference path="../_references.ts" />
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        var Navigation = (function (_super) {
            __extends(Navigation, _super);
            function Navigation() {
                _super.apply(this, arguments);
            }
            Navigation.prototype.render = function () {
                return (React.createElement("nav", {"className": "navbar navbar-default navbar-static-top", "role": "navigation", "style": { marginBottom: 0 }}, this.props["children"]));
            };
            return Navigation;
        })(React.Component);
        Views.Navigation = Navigation;
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
///<reference path="../_references.ts" />
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        var ScreenSaver = (function (_super) {
            __extends(ScreenSaver, _super);
            function ScreenSaver() {
                _super.apply(this, arguments);
            }
            ScreenSaver.prototype.render = function () {
                return (React.createElement("div", {"id": "screensaver"}, React.createElement("canvas", {"id": "canvas"}), React.createElement("i", {"className": "fa fa-lock", "id": "screen_unlock"})));
            };
            return ScreenSaver;
        })(React.Component);
        Views.ScreenSaver = ScreenSaver;
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
///<reference path="../_references.ts" />
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        var SideMenu = (function (_super) {
            __extends(SideMenu, _super);
            function SideMenu(props) {
                _super.call(this, props);
                this._nodes = [
                    { name: "Explore", id: "explore", icon: "fa-search", active: true },
                    { name: "Manage", id: "manage", children: [
                            { name: "Applications", id: "manage.apps" },
                            { name: "Networks", id: "manage.nets" },
                            { name: "Clusters", id: "manage.cluster" },
                            { name: "Servers", id: "manage.servers", children: [
                                    { name: "Applications", id: "manage.apps1" },
                                    { name: "Networks", id: "manage.nets2" },
                                    { name: "Clusters", id: "manage.cluster3" },
                                    { name: "Servers", id: "manage.servers4" },
                                ] },
                        ] },
                    { name: "Users", id: "users" },
                ];
                this.state = this.getState();
            }
            SideMenu.prototype.componentDidMount = function () {
                var node = React.findDOMNode(this.refs["side-menu"]);
                $(node).metisMenu();
            };
            SideMenu.prototype.render = function () {
                return (React.createElement("div", {"className": "navbar-default sidebar", "role": "navigation"}, React.createElement("div", {"className": "sidebar-nav navbar-collapse"}, React.createElement("ul", {"className": "nav", "id": "side-menu", "ref": "side-menu"}, React.createElement("li", null, React.createElement("a", {"href": "index.html"}, React.createElement("i", {"className": "fa fa-dashboard fa-fw"}), " Dashboard")), React.createElement("li", null, React.createElement("a", {"href": "#"}, React.createElement("i", {"className": "fa fa-bar-chart-o fa-fw"}), " Charts", React.createElement("span", {"className": "fa arrow"})), React.createElement("ul", {"className": "nav nav-second-level"}, React.createElement("li", null, React.createElement("a", {"href": "flot.html"}, "Flot Charts")), React.createElement("li", null, React.createElement("a", {"href": "morris.html"}, "Morris.js Charts")))), React.createElement("li", null, React.createElement("a", {"href": "tables.html"}, React.createElement("i", {"className": "fa fa-table fa-fw"}), " Tables")), React.createElement("li", null, React.createElement("a", {"href": "forms.html"}, React.createElement("i", {"className": "fa fa-edit fa-fw"}), " Forms")), React.createElement("li", null, React.createElement("a", {"href": "#"}, React.createElement("i", {"className": "fa fa-wrench fa-fw"}), " UI Elements", React.createElement("span", {"className": "fa arrow"})), React.createElement("ul", {"className": "nav nav-second-level"}, React.createElement("li", null, React.createElement("a", {"href": "panels-wells.html"}, "Panels and Wells")), React.createElement("li", null, React.createElement("a", {"href": "buttons.html"}, "Buttons")), React.createElement("li", null, React.createElement("a", {"href": "notifications.html"}, "Notifications")), React.createElement("li", null, React.createElement("a", {"href": "typography.html"}, "Typography")), React.createElement("li", null, React.createElement("a", {"href": "icons.html"}, " Icons")), React.createElement("li", null, React.createElement("a", {"href": "grid.html"}, "Grid")))), React.createElement("li", null, React.createElement("a", {"href": "#"}, React.createElement("i", {"className": "fa fa-sitemap fa-fw"}), " Multi-Level Dropdown", React.createElement("span", {"className": "fa arrow"})), React.createElement("ul", {"className": "nav nav-second-level"}, React.createElement("li", null, React.createElement("a", {"href": "#"}, "Second Level Item")), React.createElement("li", null, React.createElement("a", {"href": "#"}, "Second Level Item")), React.createElement("li", null, React.createElement("a", {"href": "#"}, "Third Level ", React.createElement("span", {"className": "fa arrow"})), React.createElement("ul", {"className": "nav nav-third-level"}, React.createElement("li", null, React.createElement("a", {"href": "#"}, "Third Level Item")), React.createElement("li", null, React.createElement("a", {"href": "#"}, "Third Level Item")), React.createElement("li", null, React.createElement("a", {"href": "#"}, "Third Level Item")), React.createElement("li", null, React.createElement("a", {"href": "#"}, "Third Level Item")))))), React.createElement("li", null, React.createElement("a", {"href": "#"}, React.createElement("i", {"className": "fa fa-files-o fa-fw"}), " Sample Pages", React.createElement("span", {"className": "fa arrow"})), React.createElement("ul", {"className": "nav nav-second-level"}, React.createElement("li", null, React.createElement("a", {"href": "blank.html"}, "Blank Page")), React.createElement("li", null, React.createElement("a", {"href": "login.html"}, "Login Page"))))))));
            };
            SideMenu.prototype.renderNode = function (node) {
                var _this = this;
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
                    ? React.createElement("ul", {"className": "dropdown-menu", "style": node.expanded ? { display: "block" } : null}, node.children.map(function (n) { return _this.renderNode(n); }))
                    : null;
                return (React.createElement("li", {"key": node.id, "className": liClasses}, React.createElement("a", {"href": "#", "className": aClasses, "onClick": this.onClick.bind(this, node.id)}, React.createElement("i", {"className": iconClasses}), React.createElement("span", {"className": "hidden-xs"}, node.name)), children));
            };
            SideMenu.prototype.onClick = function (id) {
                this.traverseNodes(function (node, path) {
                    if (node.id == id) {
                        node.active = true;
                        node.expanded = (node.children && node.children.length > 0)
                            ? !(node.expanded || false)
                            : false;
                        path.forEach(function (n) { return n.expanded = true; }); // expand all parent nodes
                    }
                    else {
                        node.active = false;
                        node.expanded = false;
                    }
                });
                this.setState(this.getState());
                if (this.props.onClick)
                    this.props.onClick(id);
            };
            SideMenu.prototype.traverseNodes = function (fn) {
                var iterate = function (nodes, path) {
                    if (!nodes)
                        return;
                    nodes.forEach(function (n) {
                        fn(n, path);
                        path.push(n);
                        iterate(n.children, path);
                        path.splice(path.length - 1, 1);
                    });
                };
                iterate(this._nodes, []);
            };
            SideMenu.prototype.getState = function () {
                return { model: $.extend(true, {}, this._nodes) }; // clone model
            };
            return SideMenu;
        })(React.Component);
        Views.SideMenu = SideMenu;
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
///<reference path="../_references.ts" />
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        var TopMenu = (function (_super) {
            __extends(TopMenu, _super);
            function TopMenu() {
                _super.apply(this, arguments);
            }
            TopMenu.prototype.render = function () {
                return (React.createElement("ul", {"className": "nav navbar-top-links navbar-right"}, React.createElement("li", {"className": "dropdown"}, React.createElement("a", {"className": "dropdown-toggle", "data-toggle": "dropdown", "href": "#"}, React.createElement("i", {"className": "fa fa-envelope fa-fw"}), "  ", React.createElement("i", {"className": "fa fa-caret-down"})), React.createElement("ul", {"className": "dropdown-menu dropdown-messages"}, React.createElement("li", null, React.createElement("a", {"href": "#"}, React.createElement("div", null, React.createElement("strong", null, "John Smith"), React.createElement("span", {"className": "pull-right text-muted"}, React.createElement("em", null, "Yesterday"))), React.createElement("div", null, "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend..."))), React.createElement("li", {"className": "divider"}), React.createElement("li", null, React.createElement("a", {"href": "#"}, React.createElement("div", null, React.createElement("strong", null, "John Smith"), React.createElement("span", {"className": "pull-right text-muted"}, React.createElement("em", null, "Yesterday"))), React.createElement("div", null, "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend..."))), React.createElement("li", {"className": "divider"}), React.createElement("li", null, React.createElement("a", {"href": "#"}, React.createElement("div", null, React.createElement("strong", null, "John Smith"), React.createElement("span", {"className": "pull-right text-muted"}, React.createElement("em", null, "Yesterday"))), React.createElement("div", null, "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend..."))), React.createElement("li", {"className": "divider"}), React.createElement("li", null, React.createElement("a", {"className": "text-center", "href": "#"}, React.createElement("strong", null, "Read All Messages"), React.createElement("i", {"className": "fa fa-angle-right"}))))), React.createElement("li", {"className": "dropdown"}, React.createElement("a", {"className": "dropdown-toggle", "data-toggle": "dropdown", "href": "#"}, React.createElement("i", {"className": "fa fa-tasks fa-fw"}), "  ", React.createElement("i", {"className": "fa fa-caret-down"})), React.createElement("ul", {"className": "dropdown-menu dropdown-tasks"}, React.createElement("li", null, React.createElement("a", {"href": "#"}, React.createElement("div", null, React.createElement("p", null, React.createElement("strong", null, "Task 1"), React.createElement("span", {"className": "pull-right text-muted"}, "40% Complete")), React.createElement("div", {"className": "progress progress-striped active"}, React.createElement("div", {"className": "progress-bar progress-bar-success", "role": "progressbar", "aria-valuenow": "40", "aria-valuemin": "0", "aria-valuemax": "100", "style": { width: "40%" }}, React.createElement("span", {"className": "sr-only"}, "40% Complete (success)")))))), React.createElement("li", {"className": "divider"}), React.createElement("li", null, React.createElement("a", {"href": "#"}, React.createElement("div", null, React.createElement("p", null, React.createElement("strong", null, "Task 2"), React.createElement("span", {"className": "pull-right text-muted"}, "20% Complete")), React.createElement("div", {"className": "progress progress-striped active"}, React.createElement("div", {"className": "progress-bar progress-bar-info", "role": "progressbar", "aria-valuenow": "20", "aria-valuemin": "0", "aria-valuemax": "100", "style": { width: "40%" }}, React.createElement("span", {"className": "sr-only"}, "20% Complete")))))), React.createElement("li", {"className": "divider"}), React.createElement("li", null, React.createElement("a", {"href": "#"}, React.createElement("div", null, React.createElement("p", null, React.createElement("strong", null, "Task 3"), React.createElement("span", {"className": "pull-right text-muted"}, "60% Complete")), React.createElement("div", {"className": "progress progress-striped active"}, React.createElement("div", {"className": "progress-bar progress-bar-warning", "role": "progressbar", "aria-valuenow": "60", "aria-valuemin": "0", "aria-valuemax": "100", "style": { width: "60%" }}, React.createElement("span", {"className": "sr-only"}, "60% Complete (warning)")))))), React.createElement("li", {"className": "divider"}), React.createElement("li", null, React.createElement("a", {"href": "#"}, React.createElement("div", null, React.createElement("p", null, React.createElement("strong", null, "Task 4"), React.createElement("span", {"className": "pull-right text-muted"}, "80% Complete")), React.createElement("div", {"className": "progress progress-striped active"}, React.createElement("div", {"className": "progress-bar progress-bar-danger", "role": "progressbar", "aria-valuenow": "80", "aria-valuemin": "0", "aria-valuemax": "100", "style": { width: "40%" }}, React.createElement("span", {"className": "sr-only"}, "80% Complete (danger)")))))), React.createElement("li", {"className": "divider"}), React.createElement("li", null, React.createElement("a", {"className": "text-center", "href": "#"}, React.createElement("strong", null, "See All Tasks"), React.createElement("i", {"className": "fa fa-angle-right"}))))), React.createElement("li", {"className": "dropdown"}, React.createElement("a", {"className": "dropdown-toggle", "data-toggle": "dropdown", "href": "#"}, React.createElement("i", {"className": "fa fa-bell fa-fw"}), "  ", React.createElement("i", {"className": "fa fa-caret-down"})), React.createElement("ul", {"className": "dropdown-menu dropdown-alerts"}, React.createElement("li", null, React.createElement("a", {"href": "#"}, React.createElement("div", null, React.createElement("i", {"className": "fa fa-comment fa-fw"}), " New Comment", React.createElement("span", {"className": "pull-right text-muted small"}, "4 minutes ago")))), React.createElement("li", {"className": "divider"}), React.createElement("li", null, React.createElement("a", {"href": "#"}, React.createElement("div", null, React.createElement("i", {"className": "fa fa-twitter fa-fw"}), " 3 New Followers", React.createElement("span", {"className": "pull-right text-muted small"}, "12 minutes ago")))), React.createElement("li", {"className": "divider"}), React.createElement("li", null, React.createElement("a", {"href": "#"}, React.createElement("div", null, React.createElement("i", {"className": "fa fa-envelope fa-fw"}), " Message Sent", React.createElement("span", {"className": "pull-right text-muted small"}, "4 minutes ago")))), React.createElement("li", {"className": "divider"}), React.createElement("li", null, React.createElement("a", {"href": "#"}, React.createElement("div", null, React.createElement("i", {"className": "fa fa-tasks fa-fw"}), " New Task", React.createElement("span", {"className": "pull-right text-muted small"}, "4 minutes ago")))), React.createElement("li", {"className": "divider"}), React.createElement("li", null, React.createElement("a", {"href": "#"}, React.createElement("div", null, React.createElement("i", {"className": "fa fa-upload fa-fw"}), " Server Rebooted", React.createElement("span", {"className": "pull-right text-muted small"}, "4 minutes ago")))), React.createElement("li", {"className": "divider"}), React.createElement("li", null, React.createElement("a", {"className": "text-center", "href": "#"}, React.createElement("strong", null, "See All Alerts"), React.createElement("i", {"className": "fa fa-angle-right"}))))), React.createElement("li", {"className": "dropdown"}, React.createElement("a", {"className": "dropdown-toggle", "data-toggle": "dropdown", "href": "#"}, React.createElement("i", {"className": "fa fa-user fa-fw"}), "  ", React.createElement("i", {"className": "fa fa-caret-down"})), React.createElement("ul", {"className": "dropdown-menu dropdown-user"}, React.createElement("li", null, React.createElement("a", {"href": "#"}, React.createElement("i", {"className": "fa fa-user fa-fw"}), " User Profile")), React.createElement("li", null, React.createElement("a", {"href": "#"}, React.createElement("i", {"className": "fa fa-gear fa-fw"}), " Settings")), React.createElement("li", {"className": "divider"}), React.createElement("li", null, React.createElement("a", {"href": "login.html"}, React.createElement("i", {"className": "fa fa-sign-out fa-fw"}), " Logout"))))));
            };
            return TopMenu;
        })(React.Component);
        Views.TopMenu = TopMenu;
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
