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
///<reference path="../Events/EventManager.ts" />
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        var EventMgr = Client.Events.EventManager;
        var ViewBase = (function () {
            function ViewBase(parent) {
                this._views = [];
                if (parent) {
                    this._parent = parent;
                    this._parent.addChild(this);
                }
                this._$el = $("<div></div>");
                this.bindViewEvents();
                this.bindMgrEvents();
            }
            Object.defineProperty(ViewBase.prototype, "$el", {
                get: function () {
                    return this._$el;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ViewBase.prototype, "Views", {
                get: function () {
                    return this._views;
                },
                enumerable: true,
                configurable: true
            });
            ViewBase.prototype.viewEvents = function () {
                return {};
            };
            ViewBase.prototype.mgrEvents = function () {
                return {};
            };
            ViewBase.prototype.render = function () {
                return this;
            };
            ViewBase.prototype.postRender = function () {
                this._views.forEach(function (view) { return view.postRender(); });
            };
            ViewBase.prototype.show = function () {
                this.$el.css("display", "block");
                this._views.forEach(function (view) { return view.show(); });
            };
            ViewBase.prototype.hide = function () {
                this.$el.css("display", "none");
                this._views.forEach(function (view) { return view.hide(); });
            };
            ViewBase.prototype.destroy = function () {
                this._views.forEach(function (view) { return view.destroy(); });
                if (this._parent)
                    this._parent.removeChild(this);
                this.unbindViewEvents();
                this.unbindMgrEvents();
                this._$el.remove();
            };
            ViewBase.prototype.addChild = function (view) {
                this._views.push(view);
            };
            ViewBase.prototype.removeChild = function (view) {
                var idx = this._views.indexOf(view);
                if (idx >= 0)
                    this._views.splice(idx, 1);
            };
            ViewBase.prototype.bindViewEvents = function () {
                if (!this._viewEventDefs)
                    this._viewEventDefs = this.parseEventsObj(this.viewEvents());
                for (var _i = 0, _a = this._viewEventDefs; _i < _a.length; _i++) {
                    var def = _a[_i];
                    this._$el.on(def.event, def.target, def.handler);
                }
            };
            ViewBase.prototype.bindMgrEvents = function () {
                if (!this._mgrEventDefs)
                    this._mgrEventDefs = this.parseEventsObj(this.mgrEvents());
                for (var _i = 0, _a = this._mgrEventDefs; _i < _a.length; _i++) {
                    var def = _a[_i];
                    EventMgr.on(def.target, def.event, this, def.handler);
                }
            };
            ViewBase.prototype.unbindViewEvents = function () {
                for (var _i = 0, _a = this._viewEventDefs; _i < _a.length; _i++) {
                    var def = _a[_i];
                    this._$el.off(def.event, def.target, def.handler);
                }
            };
            ViewBase.prototype.unbindMgrEvents = function () {
                for (var _i = 0, _a = this._mgrEventDefs; _i < _a.length; _i++) {
                    var def = _a[_i];
                    EventMgr.off(def.target, def.event, this, def.handler);
                }
            };
            ViewBase.prototype.parseEventsObj = function (eventsObj) {
                var _this = this;
                var result = new Array();
                for (var key in eventsObj) {
                    if (!eventsObj.hasOwnProperty(key))
                        continue;
                    var eventDef = key.trim();
                    var idx = eventDef.indexOf(" ");
                    var event, target, handler;
                    if (idx >= 0) {
                        event = eventDef.substr(0, idx);
                        target = eventDef.substr(idx + 1);
                    }
                    else {
                        event = eventDef;
                    }
                    handler = eventsObj[key];
                    if (event == "")
                        throw new Error("Event definition '" + eventDef + "' has empty event.");
                    if (target == "")
                        target = undefined;
                    if (typeof handler != "function")
                        throw new Error("Event definition '" + eventDef + "' has invalid handler.");
                    result.push(new EventDef(event, target, function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i - 0] = arguments[_i];
                        }
                        return handler.call.apply(handler, [_this].concat(args));
                    }));
                }
                return result;
            };
            return ViewBase;
        })();
        Views.ViewBase = ViewBase;
        var EventDef = (function () {
            function EventDef(event, target, handler) {
                this.event = event;
                this.target = target;
                this.handler = handler;
            }
            return EventDef;
        })();
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        var ExplorerView = (function (_super) {
            __extends(ExplorerView, _super);
            function ExplorerView() {
                _super.apply(this, arguments);
                this.template = "\n      <div class=\"row\">\n        <div class=\"col-md-3\" style=\"border: 0px solid red\">\n          <div class=\"panel panel-default\">\n            <div class=\"panel-heading\">\n              <h3 class=\"panel-title\">Games</h3>\n            </div>\n            <div class=\"panel-body\" style=\"padding:10px;\">\n              <div id=\"jstree\">\n                <ul>\n                  <li>Production\n                    <ul>\n                      <li>Total Domination\n                        <ul>\n                          <li>Manage</li>\n                          <li>Configs</li>\n                          <li>Logs</li>\n                          <li>Perfs</li>\n                          <li>Servers</li>\n                        </ul>\n                      </li>\n                      <li>Sparta</li>\n                      <li>Pirates</li>\n                      <li>Elves</li>\n                      <li>Nords</li>\n                    </ul>\n                  </li>\n                  <li>Supertest\n                    <ul>\n                      <li>Total Domination</li>\n                    </ul>\n                  </li>\n                </ul>\n              </div>\n            </div>\n          </div>\n        </div>\n        <div class=\"col-md-9\" style=\"border: 1px solid red\">\n          <h1>Title</h1>\n        </div>\n      </div>\n    ";
            }
            ExplorerView.prototype.initialize = function () {
            };
            ExplorerView.prototype.render = function () {
                this.$el.html(this.template);
                this.$el.find("#jstree").jstree();
                return this;
            };
            return ExplorerView;
        })(Client.Views.ViewBase);
        Views.ExplorerView = ExplorerView;
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
///<reference path="../_references.ts" />
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        var EventMgr = Client.Events.EventManager;
        var TopNav = (function (_super) {
            __extends(TopNav, _super);
            function TopNav() {
                _super.apply(this, arguments);
                this.template = "\n      <nav class=\"navbar navbar-default\">\n        <div class=\"container-fluid\">\n\n          <!-- Brand and toggle get grouped for better mobile display -->\n          <div class=\"navbar-header\">\n            <a class=\"navbar-brand\" href=\"#\">Plarium</a>\n          </div>\n      \n          <!-- Collect the nav links, forms, and other content for toggling -->\n          <ul class=\"nav navbar-nav\">\n            <li><a href=\"#\" data-menu-item=\"explore\">Explore <span class=\"sr-only\">(current)</span></a></li>\n            <li><a href=\"#\" data-menu-item=\"manage\">Manage</a></li>\n          </ul>\n          <ul class=\"nav navbar-nav navbar-right\">\n            <li class=\"dropdown\">\n              <a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\" role=\"button\" aria-haspopup=\"true\" aria-expanded=\"false\">Username <span class=\"caret\"></span></a>\n              <ul class=\"dropdown-menu\">\n                <li><a href=\"#\" data-menu-item=\"settings\">Settings</a></li>\n                <li><a href=\"#\" data-menu-item=\"logout\">Logout</a></li>\n              </ul>\n            </li>\n          </ul>\n        </div>\n      </nav>\n    ";
            }
            TopNav.prototype.render = function () {
                _super.prototype.render.call(this);
                this.$el.html(this.template);
                return this;
            };
            TopNav.prototype.viewEvents = function () {
                return {
                    "click a[data-menu-item]": this.menuItemClick,
                };
            };
            TopNav.prototype.menuItemClick = function (event) {
                var menuItem = $(event.target).attr("data-menu-item");
                this.setActiveMenuItem(menuItem);
                EventMgr.raise("ui.views.top-nav", "change", menuItem);
            };
            TopNav.prototype.setActiveMenuItem = function (item) {
                if (this.$activeMenuItem)
                    this.$activeMenuItem.parent("li").removeClass("active");
                this.$activeMenuItem = this.$el.find("a[data-menu-item='" + item + "']");
                if (this.$activeMenuItem)
                    this.$activeMenuItem.parent("li").addClass("active");
            };
            return TopNav;
        })(Views.ViewBase);
        Views.TopNav = TopNav;
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
///<reference path="../_references.ts" />
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        (function (MenuItem) {
            MenuItem[MenuItem["Explore"] = 0] = "Explore";
            MenuItem[MenuItem["Manage"] = 1] = "Manage";
            MenuItem[MenuItem["UserSettings"] = 2] = "UserSettings";
            MenuItem[MenuItem["UserLogout"] = 3] = "UserLogout";
        })(Views.MenuItem || (Views.MenuItem = {}));
        var MenuItem = Views.MenuItem;
        ;
        var TopNavProps = (function () {
            function TopNavProps() {
            }
            return TopNavProps;
        })();
        Views.TopNavProps = TopNavProps;
        var TopNav1 = (function (_super) {
            __extends(TopNav1, _super);
            function TopNav1(props) {
                _super.call(this, props);
                this.state = { active: this.props.activeItem };
            }
            TopNav1.prototype.setActive = function (item) {
                this.setState({ active: item });
                if (this.props.onChanged)
                    this.props.onChanged(item);
            };
            TopNav1.prototype.render = function () {
                var _this = this;
                var activeIf = function (item) { return _this.state.active == item ? "active" : null; };
                return (React.createElement("nav", {"className": "navbar navbar-default"}, React.createElement("div", {"className": "container-fluid"}, React.createElement("div", {"className": "navbar-header"}, React.createElement("a", {"className": "navbar-brand", "href": "#"}, "Plarium")), React.createElement("ul", {"className": "nav navbar-nav"}, React.createElement("li", {"className": activeIf(MenuItem.Explore)}, React.createElement("a", {"href": "#", "onClick": function () { return _this.setActive(MenuItem.Explore); }}, "Explore")), React.createElement("li", {"className": activeIf(MenuItem.Manage)}, React.createElement("a", {"href": "#", "onClick": function () { return _this.setActive(MenuItem.Manage); }}, "Manage"))), React.createElement("ul", {"className": "nav navbar-nav navbar-right"}, React.createElement("li", {"className": "dropdown"}, React.createElement("a", {"href": "#", "className": "dropdown-toggle", "data-toggle": "dropdown", "role": "button", "aria-haspopup": "true", "aria-expanded": "false"}, "Username ", React.createElement("span", {"className": "caret"})), React.createElement("ul", {"className": "dropdown-menu"}, React.createElement("li", {"className": activeIf(MenuItem.UserSettings)}, React.createElement("a", {"href": "#", "onClick": function () { return _this.setActive(MenuItem.UserSettings); }}, "Settings")), React.createElement("li", {"className": activeIf(MenuItem.UserLogout)}, React.createElement("a", {"href": "#", "onClick": function () { return _this.setActive(MenuItem.UserLogout); }}, "Logout"))))))));
            };
            return TopNav1;
        })(React.Component);
        Views.TopNav1 = TopNav1;
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        var SettingsView = (function (_super) {
            __extends(SettingsView, _super);
            function SettingsView() {
                _super.apply(this, arguments);
                this.template = "Settings view";
            }
            SettingsView.prototype.initialize = function () {
            };
            SettingsView.prototype.render = function () {
                _super.prototype.render.call(this);
                this.$el.html(this.template);
                return this;
            };
            return SettingsView;
        })(Client.Views.ViewBase);
        Views.SettingsView = SettingsView;
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        var Manage;
        (function (Manage) {
            var ManageView = (function (_super) {
                __extends(ManageView, _super);
                function ManageView() {
                    _super.apply(this, arguments);
                    this._sideNav = new Manage.NavView(this);
                    this.template = "\n      <div class=\"row\">\n        <div class=\"col-md-3 side-nav\">\n        </div>\n        <div class=\"col-md-9 content\">\n          Content\n        </div>\n      </div>\n    ";
                }
                ManageView.prototype.render = function () {
                    _super.prototype.render.call(this);
                    this.$el.html(this.template);
                    this.$el.find(".side-nav").append(this._sideNav.render().$el);
                    return this;
                };
                ManageView.prototype.mgrEvents = function () {
                    return {
                        "change ui.views.manage.nav": this.setContentView
                    };
                };
                ManageView.prototype.setContentView = function (menuItem) {
                    this.$el.find(".content").html(menuItem);
                };
                return ManageView;
            })(Client.Views.ViewBase);
            Manage.ManageView = ManageView;
        })(Manage = Views.Manage || (Views.Manage = {}));
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        var Manage;
        (function (Manage) {
            var EventMgr = Client.Events.EventManager;
            var NavView = (function (_super) {
                __extends(NavView, _super);
                function NavView() {
                    _super.apply(this, arguments);
                    this.template = "\n      <ul class=\"nav nav-pills nav-stacked\">\n        <li role=\"presentation\"><a href=\"#\" data-menu-item=\"apps\">Applications</a></li>\n        <li role=\"presentation\"><a href=\"#\" data-menu-item=\"nets\">Networks</a></li>\n        <li role=\"presentation\"><a href=\"#\" data-menu-item=\"servers\">Servers</a></li>\n        <li role=\"presentation\"><a href=\"#\" data-menu-item=\"clusters\">Clusters</a></li>\n      </ul>\n    ";
                }
                NavView.prototype.render = function () {
                    this.$el.html(this.template);
                    return this;
                };
                NavView.prototype.viewEvents = function () {
                    return {
                        "click a[data-menu-item]": this.menuItemClick
                    };
                };
                NavView.prototype.menuItemClick = function (event) {
                    var menuItem = $(event.target).attr("data-menu-item");
                    EventMgr.raise("ui.views.manage.nav", "change", menuItem);
                };
                return NavView;
            })(Client.Views.ViewBase);
            Manage.NavView = NavView;
        })(Manage = Views.Manage || (Views.Manage = {}));
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
///<reference path="typings/es6-promise/es6-promise.d.ts"/>
///<reference path="typings/jquery/jquery.d.ts"/>
///<reference path="typings/react/react.d.ts"/>
///<reference path="typings/react/react-global.d.ts"/>
///<reference path="Common/Dictionary.ts"/>
///<reference path="Events/EventManager.ts"/>
///<reference path="Models/App.ts"/>
///<reference path="Models/Entity.ts"/>
///<reference path="Models/User.ts"/>
///<reference path="Views/ViewBase.ts"/>
///<reference path="Views/ExplorerView.ts"/>
///<reference path="Views/TopNav.ts"/>
///<reference path="Views/TopNav.tsx"/>
///<reference path="Views/SettingsView.ts"/>
///<reference path="Views/Manage/ManageView.ts"/>
///<reference path="Views/Manage/NAvView.ts"/>
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
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        var ExplorerView1 = (function (_super) {
            __extends(ExplorerView1, _super);
            function ExplorerView1() {
                _super.apply(this, arguments);
            }
            ExplorerView1.prototype.componentDidMount = function () {
                var node = React.findDOMNode(this.refs["jstree"]);
                $(node).jstree();
            };
            ExplorerView1.prototype.componentDidUpdate = function () {
                console.log("componentDidUpdate");
            };
            ExplorerView1.prototype.shouldComponentUpdate = function () {
                console.log("componentShouldUpdate");
                return false;
            };
            ExplorerView1.prototype.componentWilUnmount = function () {
                var node = React.findDOMNode(this.refs["jstree"]);
                $(node).jstree("destroy");
            };
            ExplorerView1.prototype.render = function () {
                return (React.createElement("div", {"ref": "jstree"}, React.createElement("ul", null, React.createElement("li", null, "Production", React.createElement("ul", null, React.createElement("li", null, "Total Domination", React.createElement("ul", null, React.createElement("li", null, "Manage"), React.createElement("li", null, "Configs"), React.createElement("li", null, "Logs"), React.createElement("li", null, "Perfs"), React.createElement("li", null, "Servers"))), React.createElement("li", null, "Sparta"), React.createElement("li", null, "Pirates"), React.createElement("li", null, "Elves"), React.createElement("li", null, "Nords"))), React.createElement("li", null, "Supertest", React.createElement("ul", null, React.createElement("li", null, "Total Domination"))))));
            };
            return ExplorerView1;
        })(React.Component);
        Views.ExplorerView1 = ExplorerView1;
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
///<reference path="../_references.ts" />
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        var Dictionary = Client.Common.Dictionary;
        var Main = (function (_super) {
            __extends(Main, _super);
            function Main() {
                _super.apply(this, arguments);
                this._vwTopNav = new Views.TopNav(this);
                this.viewCreators = new Dictionary({
                    "explore": function (parent) { return new Views.ExplorerView(parent); },
                    "manage": function (parent) { return new Client.Views.Manage.ManageView(parent); },
                    "settings": function (parent) { return new Views.SettingsView(parent); }
                });
            }
            Main.prototype.render = function () {
                this.$el.html("\n        <div class=\"container\">\n          <div class=\"top-nav\"></div>\n          <div class=\"content\"></div>\n        </div>\n      ");
                this.$el.find(".container .top-nav").append(this._vwTopNav.render().$el);
                return this;
            };
            Main.prototype.mgrEvents = function () {
                return {
                    "change ui.views.top-nav": this.setContentView
                };
            };
            Main.prototype.setContentView = function (menuItem) {
                if (!this.viewCreators.containsKey(menuItem))
                    throw new Error("Unknown menu item '" + menuItem + "'.");
                if (this._vmContent)
                    this._vmContent.destroy();
                this._vmContent = this.viewCreators.get(menuItem)(this);
                this.$el.find(".content").append(this._vmContent.render().$el);
            };
            return Main;
        })(Views.ViewBase);
        Views.Main = Main;
        var Main1 = (function (_super) {
            __extends(Main1, _super);
            function Main1() {
                _super.apply(this, arguments);
            }
            // private _vmContent: ViewBase;
            // private viewCreators = new Dictionary<string, (parent: ViewBase) => ViewBase>({
            //   "explore": parent => new ExplorerView(parent),
            //   "manage": parent => new Client.Views.Manage.ManageView(parent),
            //   "settings": parent => new SettingsView(parent)
            // });
            Main1.prototype.topNavChanged = function (item) {
                console.log(item);
            };
            Main1.prototype.render = function () {
                return (React.createElement("div", {"className": "container"}, React.createElement("div", {"className": "top-nav"}, React.createElement(Views.TopNav1, {"activeItem": Views.MenuItem.Explore, "onChanged": this.topNavChanged})), React.createElement("div", {"className": "content"})));
            };
            return Main1;
        })(React.Component);
        Views.Main1 = Main1;
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
var User = Client.Models.User;
var TopNav = Client.Views.TopNav1;
var ExplorerView = Client.Views.ExplorerView1;
window.onload = function () {
    // var main = new Client.Views.Main();
    // $("body").append(main.render().$el);
    var view = React.createElement(Client.Views.Main1, null);
    React.render(view, document.body);
    // React.unmountComponentAtNode(document.body);
    //console.log(new A().f == new A().f);
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
