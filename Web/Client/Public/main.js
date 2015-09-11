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
                    Client.Events.EventBus.raise(channel, "change", target, oldVal, newVal);
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
            function Dictionary() {
                this._keys = [];
                this._values = [];
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
        var EventBus = (function () {
            function EventBus() {
            }
            EventBus.on = function (channel, event, scope, callback) {
                if (!this._handlers2.containsKey(channel))
                    this._handlers2.add(channel, new Dictionary());
                if (!this._handlers2.get(channel).containsKey(event))
                    this._handlers2.get(channel).add(event, new Array());
                this._handlers2.get(channel).get(event).push({ scope: scope, callback: callback });
            };
            EventBus.off = function (channel, event, scope, callback) {
                if (this._handlers2.containsKey(channel) && this._handlers2.get(channel).containsKey(event)) {
                    var handlers = this._handlers2.get(channel).get(event);
                    for (var i = 0; i < handlers.length; i++) {
                        if (handlers[i].scope == scope && handlers[i].callback == callback) {
                            handlers.splice(i, 1);
                            break;
                        }
                    }
                }
            };
            EventBus.raise = function (channel, event) {
                var args = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    args[_i - 2] = arguments[_i];
                }
                var events = this._handlers2.get(channel);
                if (!events) {
                    console.log("EventManager: invalid channel '" + channel + "'");
                    return;
                }
                var handlers = events.get(event);
                if (!handlers) {
                    console.log("EventManager: invalid event '" + event + "'");
                    return;
                }
                handlers.forEach(function (handler) { return handler.callback.call(handler.scope, args); });
                console.log("EventManager: " + channel + " -> " + event + ", " + handlers.length + " handler(s) called");
            };
            EventBus._handlers2 = new Dictionary();
            return EventBus;
        })();
        Events.EventBus = EventBus;
    })(Events = Client.Events || (Client.Events = {}));
})(Client || (Client = {}));
///<reference path="../Events/EventBus.ts" />
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        var EventBus = Client.Events.EventBus;
        var ViewBase = (function () {
            function ViewBase(parent) {
                this._views = [];
                this._events = [];
                if (parent) {
                    this._parent = parent;
                    this._parent.addChild(this);
                }
                this._$el = $("<div></div>");
                this._events = this.events();
                this.bindEvents();
                this.bindViewEvents();
                this.bindBusEvents();
                this.initialize();
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
            ViewBase.prototype.initialize = function () {
            };
            ViewBase.prototype.events = function () {
                return [];
            };
            ViewBase.prototype.viewEvents = function () {
                return {
                    "click .btn": function () { return 1; },
                    "click .lnk": function () { return 2; }
                };
            };
            ViewBase.prototype.busEvents = function () {
                return {
                    "ui.content-view change": function () { return 1; },
                    "click .lnk": function () { return 2; }
                };
            };
            ViewBase.prototype.render = function () {
                this._views.forEach(function (view) { return view.render(); });
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
                this.unbindEvents();
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
            ViewBase.prototype.bindEvents = function () {
                var _this = this;
                this._events.forEach(function (event) {
                    _this._$el.on(event.event, event.selector, event.handler.bind(_this));
                });
            };
            ViewBase.prototype.unbindEvents = function () {
                var _this = this;
                this._events.forEach(function (event) {
                    _this._$el.off(event.event, event.selector, event.handler);
                });
            };
            ViewBase.prototype.bindViewEvents = function () {
                if (!this._viewEvents)
                    this.parse;
                for (var item in this._viewEvents) {
                    if (this._viewEvents.hasOwnProperty(item)) {
                        var result = this.parse(item);
                        this._$el.on(result.event, result.target, this._viewEvents[item].bind(this));
                    }
                }
            };
            ViewBase.prototype.bindBusEvents = function () {
                for (var item in this._busEvents) {
                    if (this._busEvents.hasOwnProperty(item)) {
                        var result = this.parse(item);
                        EventBus.on(result.target, result.event, this, this._busEvents[item]);
                    }
                }
            };
            ViewBase.prototype.unbindViewEvents = function () {
                for (var item in this._viewEvents) {
                    if (this._viewEvents.hasOwnProperty(item)) {
                        var result = this.parse(item);
                        this._$el.on(result.event, result.target, this._viewEvents[item].bind(this));
                    }
                }
                // this._viewEvents.forEach(event => {
                //   this._$el.off(event.event, event.selector, event.handler);
                // });
            };
            ViewBase.prototype.parse = function (item) {
                return {
                    event: "event",
                    target: "selector"
                };
            };
            return ViewBase;
        })();
        Views.ViewBase = ViewBase;
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
///<reference path="Views/ViewBase.ts"/>
var a;
// a = new Date();
a = 1;
a = "string";
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
    __.prototype = b.prototype;
    d.prototype = new __();
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
///<reference path="Entity.ts"/>
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
///<reference path="../Models/User.ts" />
///<reference path="../Models/App.ts" />
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
                    $.ajax(url + "?rev=" + _this._revision, {
                        data: JSON.stringify(entity),
                        contentType: "application/json",
                        dataType: "JSON",
                        method: "POST" })
                        .done(function (response) {
                        _this.updateData(response.Updates);
                        resolve(response.Data);
                    })
                        .fail(reject);
                });
            };
            EntityRepository.prototype.delete = function (id) {
                var _this = this;
                return new Promise(function (resolve, reject) {
                    $.ajax(_this._url + "/" + id + "?rev=" + _this._revision, {
                        dataType: "JSON",
                        method: "DELETE" })
                        .done(function (response) {
                        _this.updateData(response.Updates);
                        resolve(response.Data);
                    })
                        .fail(reject);
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
                _super.prototype.render.call(this);
                this.$el.html(this.template);
                this.$el.find("#jstree").jstree();
            };
            return ExplorerView;
        })(Client.Views.ViewBase);
        Views.ExplorerView = ExplorerView;
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
///<reference path="../Common/Dictionary.ts"/>
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        var Dictionary = Client.Common.Dictionary;
        var EventBus = Client.Events.EventBus;
        var Main = (function (_super) {
            __extends(Main, _super);
            function Main() {
                _super.call(this);
                this._vwTopNav = new Views.TopNav(this);
                this.viewCreators = new Dictionary();
                this.viewCreators.add("explore", function (parent) { return new Views.ExplorerView(parent); });
                this.viewCreators.add("manage", function (parent) { return new Views.ManageView(parent); });
                this.viewCreators.add("settings", function (parent) { return new Views.SettingsView(parent); });
            }
            Main.prototype.render = function () {
                _super.prototype.render.call(this);
                this.$el.html("\n        <div class=\"container\">\n          <div class=\"topnav\"></div>\n          <div class=\"content\"></div>\n        </div>\n      ");
                this.$el.find(".container .topnav").append(this._vwTopNav.$el);
            };
            Main.prototype.initialize = function () {
                EventBus.on("ui.views.top-nav.menu-item", "change", this, this.setContentView);
            };
            Main.prototype.setContentView = function (menuItem) {
                if (!this.viewCreators.containsKey(menuItem))
                    throw new Error("Unknown menu item '" + menuItem + "'");
                if (this._vmContent)
                    this._vmContent.destroy();
                this._vmContent = this.viewCreators.get(menuItem)(this);
                this._vmContent.render();
                this.$el.find(".content").append(this._vmContent.$el);
            };
            return Main;
        })(Views.ViewBase);
        Views.Main = Main;
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
var Data = Client.Common.Data;
var User = Client.Models.User;
window.onload = function () {
    var main = new Client.Views.Main();
    main.render();
    $("body").append(main.$el);
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
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        var ManageView = (function (_super) {
            __extends(ManageView, _super);
            function ManageView() {
                _super.apply(this, arguments);
                this.template = "Manage view";
            }
            ManageView.prototype.initialize = function () {
            };
            ManageView.prototype.render = function () {
                _super.prototype.render.call(this);
                this.$el.html(this.template);
            };
            return ManageView;
        })(Client.Views.ViewBase);
        Views.ManageView = ManageView;
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
            };
            return SettingsView;
        })(Client.Views.ViewBase);
        Views.SettingsView = SettingsView;
    })(Views = Client.Views || (Client.Views = {}));
})(Client || (Client = {}));
///<reference path="../Events/EventBus.ts" />
var Client;
(function (Client) {
    var Views;
    (function (Views) {
        var EventBus = Client.Events.EventBus;
        var TopNav = (function (_super) {
            __extends(TopNav, _super);
            function TopNav() {
                _super.apply(this, arguments);
                this.template = "\n      <nav class=\"navbar navbar-default\">\n        <div class=\"container-fluid\">\n\n          <!-- Brand and toggle get grouped for better mobile display -->\n          <div class=\"navbar-header\">\n            <a class=\"navbar-brand\" href=\"#\">Plarium</a>\n          </div>\n      \n          <!-- Collect the nav links, forms, and other content for toggling -->\n          <ul class=\"nav navbar-nav\">\n            <li><a href=\"#\" data-menu-item=\"explore\">Explore <span class=\"sr-only\">(current)</span></a></li>\n            <li><a href=\"#\" data-menu-item=\"manage\">Manage</a></li>\n          </ul>\n          <ul class=\"nav navbar-nav navbar-right\">\n            <li class=\"dropdown\">\n              <a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\" role=\"button\" aria-haspopup=\"true\" aria-expanded=\"false\">Username <span class=\"caret\"></span></a>\n              <ul class=\"dropdown-menu\">\n                <li><a href=\"#\" data-menu-item=\"settings\">Settings</a></li>\n                <li><a href=\"#\" data-menu-item=\"logout\">Logout</a></li>\n              </ul>\n            </li>\n          </ul>\n        </div>\n      </nav>\n    ";
            }
            TopNav.prototype.render = function () {
                _super.prototype.render.call(this);
                this.$el.html(this.template);
            };
            TopNav.prototype.events = function () {
                return [
                    { event: "click", selector: "a[data-menu-item]", handler: this.menuItemClick },
                ];
            };
            TopNav.prototype.menuItemClick = function (event) {
                var menuItem = $(event.target).attr("data-menu-item");
                this.setActiveMenuItem(menuItem);
                EventBus.raise("ui.views.top-nav.menu-item", "change", menuItem);
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
