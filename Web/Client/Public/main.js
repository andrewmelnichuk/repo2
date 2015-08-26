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
var a;
// a = new Date();
a = 1;
a = "string";
var Client;
(function (Client) {
    var Common;
    (function (Common) {
        var Repository = (function () {
            function Repository(url) {
                this._storage = {};
                this._url = url;
            }
            Repository.prototype.get = function (id) {
                var _this = this;
                var entity = this._storage[id];
                return new Promise(function (resolve, reject) {
                    if (entity)
                        resolve(entity);
                    else
                        $.get(_this._url).done(function () { return resolve(null); });
                });
            };
            Repository.prototype.get2 = function () {
                this.get(1).then(function (value) { return console.log(value); }, function (error) { return console.log("error"); });
            };
            return Repository;
        })();
        Common.Repository = Repository;
    })(Common = Client.Common || (Client.Common = {}));
})(Client || (Client = {}));
var DataAccess;
(function (DataAccess) {
    var Products = (function () {
        function Products() {
        }
        Products.prototype.Save = function () {
            console.log("Product save.");
        };
        return Products;
    })();
    DataAccess.Products = Products;
})(DataAccess || (DataAccess = {}));
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
var Client;
(function (Client) {
    var Models;
    (function (Models) {
        var Data = (function () {
            function Data() {
            }
            Data.Users = {};
            return Data;
        })();
        Models.Data = Data;
    })(Models = Client.Models || (Client.Models = {}));
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
                _this._$el.on(event.event, event.selector, event.handler);
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
///<reference path="ViewBase.ts"/>
///<reference path="TextBox.ts"/>
///<reference path="../typings/es6-promise/es6-promise.d.ts"/>
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
            this.$el.html("hello world");
            this.$el.append(this._tbName.$el);
        };
        Main.prototype.events = function () {
            return [
                { event: "click", selector: "", handler: this.onClick }
            ];
        };
        Main.prototype.onClick = function () {
            console.log("click!!!");
        };
        return Main;
    })(Views.ViewBase);
    Views.Main = Main;
})(Views || (Views = {}));
function Activator(type) {
    return new type();
}
var User = Client.Models.User;
var HttpMethod;
(function (HttpMethod) {
    HttpMethod[HttpMethod["GET"] = 0] = "GET";
    HttpMethod[HttpMethod["POST"] = 1] = "POST";
})(HttpMethod || (HttpMethod = {}));
;
var HttpBodyFormat;
(function (HttpBodyFormat) {
    HttpBodyFormat[HttpBodyFormat["UrlEncoded"] = 0] = "UrlEncoded";
    HttpBodyFormat[HttpBodyFormat["Json"] = 1] = "Json";
})(HttpBodyFormat || (HttpBodyFormat = {}));
;
var HttpClient = (function () {
    function HttpClient(url) {
        this._headers = {};
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
    HttpClient.prototype.call = function () {
        var url = this._url;
        if (this._query)
            url += '?' + this._query;
        var body = (this._method != HttpMethod.GET) ? this._body : undefined;
        this._xhr.open(HttpMethod[this._method], url, true);
        for (var header in this._headers)
            this._xhr.setRequestHeader(header, this._headers[header]);
        this._xhr.send(body);
    };
    HttpClient.prototype.response = function (callback) {
        return this;
    };
    return HttpClient;
})();
var Config = (function () {
    function Config() {
    }
    Config.ApiUrl = "http://localhost:5004/api";
    return Config;
})();
var Url = (function () {
    function Url() {
    }
    Url.api = function (path) {
        return (path.charAt(0) != '/')
            ? Config.ApiUrl + '/' + path
            : Config.ApiUrl + path;
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
var BaseCmd = (function () {
    function BaseCmd() {
        this._cbDefault = function (_) { };
        this._done = this._cbDefault;
        this._fail = this._cbDefault;
        this._always = this._cbDefault;
    }
    BaseCmd.prototype.done = function (callback) {
        this._done = callback || this._cbDefault;
        return this;
    };
    BaseCmd.prototype.fail = function (callback) {
        this._fail = callback || this._cbDefault;
        return this;
    };
    BaseCmd.prototype.always = function (callback) {
        this._always = callback || this._cbDefault;
        return this;
    };
    BaseCmd.prototype.execute = function () {
    };
    return BaseCmd;
})();
var JsonCmd = (function (_super) {
    __extends(JsonCmd, _super);
    function JsonCmd(url, method, data, query) {
        _super.call(this);
        this._client = new HttpClient();
        // create envelope
        this._client.url(Url.api(url));
        this._client.method(method);
        this._client.query(Utils.urlEncode(query));
        if (data) {
            this._client.body(JSON.stringify(data));
            this._client.header("Content-Type", "application/json");
        }
        this._client.response(this.response);
    }
    JsonCmd.prototype.response = function (response) {
        // deserealize and process envelope
        var code;
        if (code == 200)
            this._done({});
        else if (code != 500)
            this._fail({});
        this._always({});
    };
    JsonCmd.prototype.execute = function () {
        this._client.call();
    };
    return JsonCmd;
})(BaseCmd);
var SyncCmd = (function (_super) {
    __extends(SyncCmd, _super);
    function SyncCmd(rev) {
        _super.call(this);
        this._rev = rev;
    }
    SyncCmd.prototype.execute = function () {
        var _this = this;
        new JsonCmd("/sync/index", HttpMethod.GET, undefined, { rev: this._rev })
            .done(function (result) {
            // update model
            _this._done(result);
        })
            .fail(function (result) {
            _this._fail(result);
        })
            .always(function (result) {
            _this._always(result);
        })
            .execute();
    };
    SyncCmd.prototype.doSync = function (result) {
        console.log('update model');
    };
    SyncCmd.get = function (id) {
        return new Promise(function (resolve, reject) {
            $.getJSON("http://localhost:5004/api/users/1")
                .done(function (result) { return resolve(User.fromJson(result)); })
                .fail(function (result) { return reject(result); });
        });
    };
    return SyncCmd;
})(BaseCmd);
window.onload = function () {
    var m = new Views.Main();
    m.render();
    $("#body").replaceWith(m.$el);
    new SyncCmd(0)
        .done(function () { return console.log('sync done'); })
        .fail(function () { return console.log('sync fail'); })
        .always(function () { return console.log('sync always'); })
        .execute();
};
