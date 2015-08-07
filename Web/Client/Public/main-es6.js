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
var a;
// a = new Date();
a = 1;
a = "string";
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
    setTimeout(() => m.destroy(), 3000);
    UserMgr.get(1).then(user => console.log(user));
};
var User = Client.Models.User;
class UserMgr {
    static get(id) {
        return new Promise((resolve, reject) => {
            $.getJSON("http://localhost:5004/api/users/1")
                .done(result => resolve(User.fromJson(result)))
                .fail(result => { });
        });
    }
}
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
