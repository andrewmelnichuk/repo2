class Config {
    static get apiUrl() {
        return this.cfg.apiUrl;
    }
    static get cfg() {
        if (!window.hasOwnProperty("config"))
            throw new Error("Configuration not found");
        return window["config"];
    }
}
function model(eventsChannel) {
    return (target) => {
        target["eventsChannel"] = eventsChannel;
        return target;
    };
}
function property(target, property) {
    var value = this[property];
    if (delete this[property]) {
        Object.defineProperty(target, property, {
            get: () => value,
            set: (newVal) => {
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
class Utils {
    static toQueryString(data) {
        var result;
        var i = 0, keys = Object.keys(data);
        for (var key in keys) {
            result += key + "=" + data[key];
            if (i < keys.length - 1)
                result += '&';
        }
        return result;
    }
    static apiUrl(path) {
        return (path.charAt(0) != '/')
            ? '/' + Config.apiUrl
            : Config.apiUrl;
    }
}
var a;
// a = new Date();
a = 1;
a = "string";
var Client;
(function (Client) {
    var Commands;
    (function (Commands) {
        class BaseCmd {
            constructor() {
                this._cbDefault = _ => { };
                this._done = this._cbDefault;
                this._fail = this._cbDefault;
                this._always = this._cbDefault;
            }
            done(callback) {
                this._done = callback || this._cbDefault;
                return this;
            }
            fail(callback) {
                this._fail = callback || this._cbDefault;
                return this;
            }
            always(callback) {
                this._always = callback || this._cbDefault;
                return this;
            }
            execute() {
            }
        }
        Commands.BaseCmd = BaseCmd;
    })(Commands = Client.Commands || (Client.Commands = {}));
})(Client || (Client = {}));
var Client;
(function (Client) {
    var Commands;
    (function (Commands) {
        var HttpClient = Client.Common.HttpClient;
        class JsonCmd extends Commands.BaseCmd {
            constructor(url, method, data, query) {
                super();
                this._client = new HttpClient();
                // create envelope
                this._client
                    .url(Utils.apiUrl(url))
                    .method(method)
                    .query(Utils.toQueryString(query))
                    .body(JSON.stringify(data))
                    .header("Content-Type", "application/json")
                    .response(this.response);
            }
            response(response) {
                // deserealize and process envelope
                var code;
                if (code == 200)
                    this._done({});
                else if (code != 500)
                    this._fail({});
                this._always({});
            }
            execute() {
                this._client.call();
            }
        }
        Commands.JsonCmd = JsonCmd;
    })(Commands = Client.Commands || (Client.Commands = {}));
})(Client || (Client = {}));
var Client;
(function (Client) {
    var Commands;
    (function (Commands) {
        var HttpMethod = Client.Common.HttpMethod;
        class SyncCmd extends Commands.BaseCmd {
            constructor(rev) {
                super();
                this._rev = rev;
            }
            execute() {
                new Commands.JsonCmd("/sync/index", HttpMethod.Get, undefined, { rev: this._rev })
                    .done(result => {
                    // update model
                    this._done(result);
                })
                    .fail(result => {
                    this._fail(result);
                })
                    .always(result => {
                    this._always(result);
                });
            }
            doSync(result) {
                console.log('update model');
            }
            static get(id) {
                return new Promise((resolve, reject) => {
                    $.getJSON("http://localhost:5004/api/users/1")
                        .done(result => resolve(User.fromJson(result)))
                        .fail(result => reject(result));
                });
            }
        }
        Commands.SyncCmd = SyncCmd;
    })(Commands = Client.Commands || (Client.Commands = {}));
})(Client || (Client = {}));
var Client;
(function (Client) {
    var Common;
    (function (Common) {
        (function (HttpMethod) {
            HttpMethod[HttpMethod["Get"] = 0] = "Get";
            HttpMethod[HttpMethod["Post"] = 1] = "Post";
        })(Common.HttpMethod || (Common.HttpMethod = {}));
        var HttpMethod = Common.HttpMethod;
        ;
        class HttpClient {
            constructor(url) {
                this._headers = {};
                this._xhr = new XMLHttpRequest();
                if (url)
                    this._url = url;
            }
            url(url) {
                this._url = url;
                return this;
            }
            query(query) {
                this._query = query;
                return this;
            }
            header(name, value) {
                this._headers[name] = value;
                return this;
            }
            body(data) {
                this._body = data;
                return this;
            }
            method(method) {
                this._method = method;
                return this;
            }
            call() {
                var url = this._url;
                if (this._query)
                    url += '?' + this._query;
                for (var header in this._headers)
                    this._xhr.setRequestHeader(header, this._headers[header]);
                var body = (this._method != HttpMethod.Get) ? this._body : undefined;
                this._xhr.open(HttpMethod[this._method], url, true);
                this._xhr.send(body);
                // TODO add response callback
            }
            response(callback) {
                return this;
            }
        }
        Common.HttpClient = HttpClient;
    })(Common = Client.Common || (Client.Common = {}));
})(Client || (Client = {}));
var Client;
(function (Client) {
    var Common;
    (function (Common) {
        class Repository {
            constructor(url) {
                this._storage = {};
                this._url = url;
            }
            get(id) {
                var entity = this._storage[id];
                return new Promise((resolve, reject) => {
                    if (entity)
                        resolve(entity);
                    else
                        $.get(this._url).done(() => resolve(null));
                });
            }
            get2() {
                this.get(1).then((value) => console.log(value), (error) => console.log("error"));
            }
        }
        Common.Repository = Repository;
    })(Common = Client.Common || (Client.Common = {}));
})(Client || (Client = {}));
var DataAccess;
(function (DataAccess) {
    class Products {
        Save() {
            console.log("Product save.");
        }
    }
    DataAccess.Products = Products;
})(DataAccess || (DataAccess = {}));
var Client;
(function (Client) {
    var Models;
    (function (Models) {
        class Entity {
        }
        Models.Entity = Entity;
    })(Models = Client.Models || (Client.Models = {}));
})(Client || (Client = {}));
///<reference path="../Models/Entity.ts"/>
var DataAccess;
(function (DataAccess) {
    class Users {
        Save() {
            console.log("User saved.");
        }
        static Fn() {
            console.log("static fn");
        }
        SetI(val) {
            this.i = val;
        }
        SetC(val) {
            this.c = val;
        }
    }
    DataAccess.Users = Users;
})(DataAccess || (DataAccess = {}));
var Events;
(function (Events) {
    class EventBus {
        constructor() {
            this._handlers = {};
        }
        static get Instance() {
            return (!EventBus._instance)
                ? (EventBus._instance = new EventBus())
                : EventBus._instance;
        }
        on(channel, event, ctx, callback) {
            this._handlers[channel] = this._handlers[channel] || {};
            this._handlers[channel][event] = this._handlers[channel][event] || new Array();
            this._handlers[channel][event].push({ ctx: ctx, callback: callback });
        }
        off(channel, event, ctx, callback) {
            var handlers = (this._handlers[channel] || {})[event];
            if (!handlers)
                return;
            for (var i = 0; i < handlers.length; i++) {
                if (handlers[i].ctx == ctx && handlers[i].callback == callback) {
                    handlers.splice(i, 1);
                    break;
                }
            }
        }
        fire(channel, event, ...args) {
            var handlers = (this._handlers[channel] || {})[event];
            if (handlers)
                handlers.forEach((handler) => handler.callback.call(handler.ctx, args));
            else
                console.log("handlers for channel '%s', event '%s' not found", channel, event);
        }
    }
    Events.EventBus = EventBus;
})(Events || (Events = {}));
var Client;
(function (Client) {
    var Models;
    (function (Models) {
        class Data {
        }
        Data.Users = {};
        Models.Data = Data;
    })(Models = Client.Models || (Client.Models = {}));
})(Client || (Client = {}));
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
        let User = class extends Models.Entity {
            static fromJson(json) {
                var u = new User();
                u.login = json.Login;
                u.password = json.Password;
                u.firstName = json.FirstName;
                u.lastName = json.LastName;
                return u;
            }
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
        Models.User = User;
    })(Models = Client.Models || (Client.Models = {}));
})(Client || (Client = {}));
var Views;
(function (Views) {
    class ViewBase {
        constructor(parent, el) {
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
        get $el() {
            return this._$el;
        }
        get Views() {
            return this._views;
        }
        events() {
            return [];
        }
        render() {
            this._views.forEach(view => view.render());
        }
        show() {
            this.$el.css("display", "block");
            this._views.forEach(view => view.show());
        }
        hide() {
            this.$el.css("display", "none");
            this._views.forEach(view => view.hide());
        }
        destroy() {
            this._views.forEach(view => view.destroy());
            if (this._parent)
                this._parent.removeChild(this);
            this.unbindEvents();
            this._$el.remove();
        }
        addChild(view) {
            this._views.push(view);
        }
        removeChild(view) {
            var idx = this._views.indexOf(view);
            if (idx >= 0)
                this._views.splice(idx, 1);
        }
        bindEvents() {
            this._events.forEach(event => {
                this._$el.on(event.event, event.selector, event.handler);
            });
        }
        unbindEvents() {
            this._events.forEach(event => {
                this._$el.off(event.event, event.selector, event.handler);
            });
        }
    }
    Views.ViewBase = ViewBase;
})(Views || (Views = {}));
///<reference path="ViewBase.ts"/>
var Views;
(function (Views) {
    class Main extends Views.ViewBase {
        constructor(...args) {
            super(...args);
            this._tbName = new Views.TextBox(this);
        }
        render() {
            super.render();
            this.$el.html("hello world");
            this.$el.append(this._tbName.$el);
        }
        events() {
            return [
                { event: "click", selector: "", handler: this.onClick }
            ];
        }
        onClick() {
            console.log("click!!!");
        }
    }
    Views.Main = Main;
})(Views || (Views = {}));
function Activator(type) {
    return new type();
}
window.onload = () => {
    var m = new Views.Main();
    m.render();
    $("#body").replaceWith(m.$el);
    var cmd = new Client.Commands.SyncCmd(0)
        .done(() => console.log('sync done'))
        .fail(() => console.log('sync fail'))
        .always(() => console.log('sync always'));
};
var User = Client.Models.User;
///<reference path="ViewBase.ts"/>
var Views;
(function (Views) {
    class TextBox extends Views.ViewBase {
        render() {
            super.render();
            this.$el.html("<input type=\"text\" value=\"asd\"></input>");
        }
    }
    Views.TextBox = TextBox;
})(Views || (Views = {}));
