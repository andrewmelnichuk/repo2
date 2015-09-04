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
                    Events.EventBus.Instance.fire(channel, "change", target, oldVal, newVal);
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
var Views;
(function (Views) {
    var ViewBase = (function () {
        function ViewBase(parent, el) {
            this.hello = 1;
            this._views = [];
            this._events = [];
            if (parent) {
                this._parent = parent;
                this._parent.addChild(this);
            }
            this._$el = el ? $(el) : $("<div></div>");
            this._events = this.events();
            this.bindEvents();
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
        ViewBase.prototype.events = function () {
            return [];
        };
        ViewBase.prototype.render = function () {
            this._views.forEach(function (view) { return view.render(); });
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
        return ViewBase;
    })();
    Views.ViewBase = ViewBase;
})(Views || (Views = {}));
///<reference path="ViewBase.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Views;
(function (Views) {
    var TextBox = (function (_super) {
        __extends(TextBox, _super);
        function TextBox() {
            _super.apply(this, arguments);
        }
        TextBox.prototype.render = function () {
            _super.prototype.render.call(this);
            this.$el.html("<input type=\"text\" value=\"asd\"></input>");
        };
        return TextBox;
    })(Views.ViewBase);
    Views.TextBox = TextBox;
})(Views || (Views = {}));
///<reference path="Views/ViewBase.ts"/>
///<reference path="Views/TextBox.ts"/> 
var a;
// a = new Date();
a = 1;
a = "string";
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
var Events;
(function (Events) {
    var EventBus = (function () {
        function EventBus() {
            this._handlers = {};
        }
        Object.defineProperty(EventBus, "Instance", {
            get: function () {
                return (!EventBus._instance)
                    ? (EventBus._instance = new EventBus())
                    : EventBus._instance;
            },
            enumerable: true,
            configurable: true
        });
        EventBus.prototype.on = function (channel, event, ctx, callback) {
            this._handlers[channel] = this._handlers[channel] || {};
            this._handlers[channel][event] = this._handlers[channel][event] || new Array();
            this._handlers[channel][event].push({ ctx: ctx, callback: callback });
        };
        EventBus.prototype.off = function (channel, event, ctx, callback) {
            var handlers = (this._handlers[channel] || {})[event];
            if (!handlers)
                return;
            for (var i = 0; i < handlers.length; i++) {
                if (handlers[i].ctx == ctx && handlers[i].callback == callback) {
                    handlers.splice(i, 1);
                    break;
                }
            }
        };
        EventBus.prototype.fire = function (channel, event) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var handlers = (this._handlers[channel] || {})[event];
            if (handlers)
                handlers.forEach(function (handler) { return handler.callback.call(handler.ctx, args); });
            else
                console.log("handlers for channel '%s', event '%s' not found", channel, event);
        };
        return EventBus;
    })();
    Events.EventBus = EventBus;
})(Events || (Events = {}));
///<reference path="../_references.ts"/>
///<reference path="TextBox.ts"/>
var Views;
(function (Views) {
    var Main = (function (_super) {
        __extends(Main, _super);
        function Main() {
            _super.apply(this, arguments);
            this._tbName = new Views.TextBox(this);
        }
        Main.prototype.render = function () {
            _super.prototype.render.call(this);
            this.$el.html(template);
        };
        Main.prototype.events = function () {
            return [];
        };
        Main.prototype.onRefreshClick = function () {
            Data.users.refresh();
        };
        Main.prototype.onDeleteClick = function () {
            Data.users.delete(this.$el.find(".id").val());
        };
        return Main;
    })(Views.ViewBase);
    Views.Main = Main;
})(Views || (Views = {}));
function Activator(type) {
    return new type();
}
var Data = Client.Common.Data;
var User = Client.Models.User;
window.onload = function () {
    var m = new Views.Main();
    m.render();
    $("body").replaceWith(template);
    $(".easyui-layout").layout();
    $(".easyui-layout .easyui-panel").panel();
    console.log(Data);
    Promise.all([
        Data.users.initialize(),
        Data.apps.initialize()
    ])
        .then(function (vals) {
        console.log(Data.apps.all().length);
        console.log(Data.users.all().length);
    });
};
var template = "\n  <div class=\"easyui-layout\" style=\"height:100%;\">\n    <div data-options=\"region:'south',split:true\" style=\"height:50px;\">\n    </div>\n    <div data-options=\"region:'west',split:true\" style=\"width:300px;\">\n      <div class=\"easyui-panel\" title=\"Clusters\" style=\"border-width:0;height:100%\"\">\n      tree\n      </div>\n    </div>\n    <div data-options=\"region:'center',title:''\"></div>\n  </div>\n";
