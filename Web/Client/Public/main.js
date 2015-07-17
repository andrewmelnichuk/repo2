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
var Models;
(function (Models) {
    var Entity = (function () {
        function Entity() {
        }
        return Entity;
    })();
    Models.Entity = Entity;
})(Models || (Models = {}));
///<reference path="../Models/Entity.ts"/>
var DataAccess;
(function (DataAccess) {
    var Users = (function () {
        function Users() {
        }
        Users.prototype.Save = function () {
            console.log("User saved.");
        };
        Users.Fn = function () {
            console.log("static fn");
        };
        Users.prototype.SetI = function (val) {
            this.i = val;
        };
        Users.prototype.SetC = function (val) {
            this.c = val;
        };
        return Users;
    })();
    DataAccess.Users = Users;
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
if (typeof __decorate !== "function") __decorate = function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var Models;
(function (Models) {
    var Order = (function () {
        function Order() {
        }
        __decorate([
            property
        ], Order.prototype, "num");
        Order = __decorate([
            model("models.Order")
        ], Order);
        return Order;
    })();
    Models.Order = Order;
})(Models || (Models = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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
})(Models || (Models = {}));
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
window.onload = function () {
    var m = new Views.Main();
    m.render();
    $("#body").replaceWith(m.$el);
    setTimeout(function () { return m.destroy(); }, 3000);
    UserMgr.get(1).then(function (user) { return console.log(user); });
};
var UserMgr = (function () {
    function UserMgr() {
    }
    UserMgr.get = function (id) {
        return new Promise(function (resolve, reject) {
            $.getJSON("http://localhost:5004/api/users/1")
                .done(function (result) { return resolve(Models.User.fromJson(result)); })
                .fail(function (result) { });
        });
    };
    return UserMgr;
})();
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
