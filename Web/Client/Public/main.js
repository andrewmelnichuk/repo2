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
        var ExploreView = (function (_super) {
            __extends(ExploreView, _super);
            function ExploreView() {
                _super.apply(this, arguments);
            }
            ExploreView.prototype.componentDidMount = function () {
                var node = React.findDOMNode(this.refs["jstree"]);
                $(node).jstree();
                console.log("tree did mount");
            };
            ExploreView.prototype.componentDidUpdate = function () {
                console.log("componentDidUpdate");
            };
            ExploreView.prototype.shouldComponentUpdate = function () {
                console.log("componentShouldUpdate");
                return false;
            };
            ExploreView.prototype.componentWilUnmount = function () {
                var node = React.findDOMNode(this.refs["jstree"]);
                $(node).jstree("destroy");
            };
            ExploreView.prototype.render = function () {
                return (React.createElement("div", {"className": "row"}, React.createElement("div", {"className": "col-xs-2"}, React.createElement("ul", null, React.createElement("li", null, "Inbox"), React.createElement("li", null, "Starred"), React.createElement("li", null, "Important"), React.createElement("li", null, "Sent Mail"))), React.createElement("div", {"className": "col-xs-10"}, "content")));
            };
            return ExploreView;
        })(React.Component);
        Views.ExploreView = ExploreView;
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
///<reference path="typings/window/window.d.ts"/>
///<reference path="Common/Dictionary.ts"/>
///<reference path="Events/EventManager.ts"/>
///<reference path="Models/App.ts"/>
///<reference path="Models/Entity.ts"/>
///<reference path="Models/User.ts"/>
///<reference path="Views/ViewBase.ts"/>
///<reference path="Views/ExploreView.tsx"/>
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
        var Header = (function (_super) {
            __extends(Header, _super);
            function Header() {
                _super.apply(this, arguments);
            }
            Header.prototype.render = function () {
                return (React.createElement("header", {"className": "navbar"}, React.createElement("div", {"className": "container-fluid expanded-panel"}, React.createElement("div", {"className": "row"}, React.createElement("div", {"id": "logo", "className": "col-xs-12 col-sm-2"}, React.createElement("a", {"href": "index.html"}, "Plarium")), React.createElement("div", {"id": "top-panel", "className": "col-xs-12 col-sm-10"}, React.createElement("div", {"className": "row"}, React.createElement("div", {"className": "col-xs-8 col-sm-4"}, React.createElement("a", {"href": "#", "className": "show-sidebar"}, React.createElement("i", {"className": "fa fa-bars"})), React.createElement("div", {"id": "search"}, React.createElement("input", {"type": "text", "placeholder": "search"}), React.createElement("i", {"className": "fa fa-search"}))), React.createElement("div", {"className": "col-xs-4 col-sm-8 top-panel-right"}, React.createElement("ul", {"className": "nav navbar-nav pull-right panel-menu"}, React.createElement("li", {"className": "hidden-xs"}, React.createElement("a", {"href": "index.html", "className": "modal-link"}, React.createElement("i", {"className": "fa fa-bell"}), React.createElement("span", {"className": "badge"}, "7"))), React.createElement("li", {"className": "hidden-xs"}, React.createElement("a", {"className": "ajax-link", "href": "ajax/calendar.html"}, React.createElement("i", {"className": "fa fa-calendar"}), React.createElement("span", {"className": "badge"}, "7"))), React.createElement("li", {"className": "hidden-xs"}, React.createElement("a", {"href": "ajax/page_messages.html", "className": "ajax-link"}, React.createElement("i", {"className": "fa fa-envelope"}), React.createElement("span", {"className": "badge"}, "7"))), React.createElement("li", {"className": "dropdown"}, React.createElement("a", {"href": "#", "className": "dropdown-toggle account", "data-toggle": "dropdown"}, React.createElement("div", {"className": "avatar"}, React.createElement("img", {"src": "img/avatar.jpg", "className": "img-rounded", "alt": "avatar"})), React.createElement("i", {"className": "fa fa-angle-down pull-right"}), React.createElement("div", {"className": "user-mini pull-right"}, React.createElement("span", {"className": "welcome"}, "Welcome,"), React.createElement("span", null, "Jane Devoops"))), React.createElement("ul", {"className": "dropdown-menu"}, React.createElement("li", null, React.createElement("a", {"href": "#"}, React.createElement("i", {"className": "fa fa-user"}), React.createElement("span", null, "Profile"))), React.createElement("li", null, React.createElement("a", {"href": "ajax/page_messages.html", "className": "ajax-link"}, React.createElement("i", {"className": "fa fa-envelope"}), React.createElement("span", null, "Messages"))), React.createElement("li", null, React.createElement("a", {"href": "ajax/gallery_simple.html", "className": "ajax-link"}, React.createElement("i", {"className": "fa fa-picture-o"}), React.createElement("span", null, "Albums"))), React.createElement("li", null, React.createElement("a", {"href": "ajax/calendar.html", "className": "ajax-link"}, React.createElement("i", {"className": "fa fa-tasks"}), React.createElement("span", null, "Tasks"))), React.createElement("li", null, React.createElement("a", {"href": "#"}, React.createElement("i", {"className": "fa fa-cog"}), React.createElement("span", null, "Settings"))), React.createElement("li", null, React.createElement("a", {"href": "#"}, React.createElement("i", {"className": "fa fa-power-off"}), React.createElement("span", null, "Logout 1")))))))))))));
            };
            return Header;
        })(React.Component);
        Views.Header = Header;
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
                    .add("explore", React.createElement(Views.ExploreView, null))
                    .add("manage.apps", React.createElement(Views.ManageView, null));
                this.state = { activeItem: "explore" };
            }
            Index.prototype.onClick = function (item) {
                if (this.contentViews.containsKey(item))
                    this.setState({ activeItem: item });
            };
            Index.prototype.render = function () {
                return (React.createElement("div", null, React.createElement(Views.ScreenSaver, null), React.createElement(Views.ModalBox, null), React.createElement(Views.Header, null), React.createElement("div", {"id": "main", "className": "container-fluid"}, React.createElement("div", {"className": "row"}, React.createElement("div", {"id": "sidebar-left", "className": "col-xs-2 col-sm-2"}, React.createElement(Views.MainMenu, {"onClick": this.onClick.bind(this)})), React.createElement("div", {"id": "content", "className": "col-xs-12 col-sm-10"}, this.contentViews.get(this.state.activeItem))))));
            };
            return Index;
        })(React.Component);
        Views.Index = Index;
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
window.onload = function () {
    React.render(React.createElement(Client.Views.Index, null), document.body);
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
