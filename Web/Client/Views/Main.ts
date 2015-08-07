///<reference path="ViewBase.ts"/>

module Views {
  
  export class Main extends ViewBase {
    
    private _tbName: TextBox = new TextBox(this);
    
    public render() {
      super.render();
      this.$el.html("hello world");
      
      this.$el.append(this._tbName.$el);
    }
    
    public events(): Array<IViewEvent> {
      return [
        {event: "click", selector: "", handler: this.onClick}
      ];
    }
    
    private onClick() {
      console.log("click!!!");
    }
  }
}

function Activator<T>(type: {new(): T}) : T {
  return new type();
}

window.onload = () => {
  var m = new Views.Main();
  m.render();
  $("#body").replaceWith(m.$el);

  var cmd = new SyncCmd(0)
    .done(() => console.log('sync done'))
    .fail(() => console.log('sync fail'))
    .always(() => console.log('sync always'))

};

import User = Client.Models.User;

enum HttpMethod {Get, Post};
enum HttpBodyFormat {UrlEncoded, Json};

class HttpClient {
  private _url: string;
  private _method: HttpMethod;
  private _body: string;
  private _query: string;
  private _headers: Client.Common.IDictionary<string> = {};
  private _xhr: XMLHttpRequest = new XMLHttpRequest();

  constructor (url?: string) {
    if (url)
      this._url = url;
  }

  public url(url: string): HttpClient {
    this._url = url;
    return this;
  }

  public query(query: string): HttpClient {
    this._query = query;
    return this;
  }

  public header(name: string, value: string): HttpClient {
    this._headers[name] = value;
    return this;
  }

  public body(data: string): HttpClient {
    this._body = data;
    return this;
  }

  public method(method: HttpMethod): HttpClient {
    this._method = method;
    return this;
  }

  public call(): void {

    var url = this._url;

    if (this._query)
      url += '?' + this._query;

    for (var header in this._headers)
      this._xhr.setRequestHeader(header, this._headers[header]);

    var body = (this._method != HttpMethod.Get) ? this._body : undefined;

    this._xhr.open(HttpMethod[this._method], url, true);
    this._xhr.send(body);
  }

  public response(callback: (response: string) => void): HttpClient {
    return this;
  }
}

class Config {
  public static ApiUrl = "http://localhost:5004/api";
}

class Url {
  public static api (path: string): string {
    return (path.charAt(0) != '/')
      ? '/' + Config.ApiUrl
      : Config.ApiUrl;
  }
}

class Utils {
  public static urlEncode(data: Object): string {
    var result: string;
    var i = 0, keys = Object.keys(data);
    for (var key in keys) {
      result += key + "=" + data[key];
      if (i < keys.length - 1)
        result += '&';
    }
    return result;
  }
}

class JsonCmd extends BaseCmd {

  private _client = new HttpClient(); 


  constructor(url: string, method: HttpMethod, data?: Object, query?: Object) {
    super();
    
    // create envelope
    
    this._client
        .url(Url.api(url))
        .method(method)
        .query(Utils.urlEncode(query))
        .body(JSON.stringify(data))
        .header("Content-Type", "application/json")
        .response(this.response);
  }

  private response(response: any): void {
    // deserealize and process envelope
    var code;
    if (code == 200)
      this._done({});
    else if (code != 500)
      this._fail({});
    this._always({});
  }

  public execute(): void {
    this._client.call();
  }
}

class BaseCmd {

  private _cbDefault: (result: any) => void = _ => {};

  protected _done: (result: any) => void = this._cbDefault;
  protected _fail: (result: any) => void = this._cbDefault;
  protected _always: (result: any) => void = this._cbDefault;
  
  public done(callback: (result: any) => void): BaseCmd {
    this._done = callback || this._cbDefault;
    return this;
  }
  
  public fail(callback: (result: any) => void): BaseCmd {
    this._fail = callback || this._cbDefault;
    return this;
  }

  public always(callback: (result: any) => void): BaseCmd {
    this._always = callback || this._cbDefault;
    return this;
  }
  
  public execute(): void {
  }
}

class SyncCmd extends BaseCmd {
  private _rev: number;

  constructor (rev: number) {
    super();
    this._rev = rev;
  }

  public execute() {
    new JsonCmd("/sync/index", HttpMethod.Get, undefined, {rev: this._rev})
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

  private doSync(result: any): void {
    console.log('update model');
  }

  public static get(id:number): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      $.getJSON("http://localhost:5004/api/users/1")
       .done(result => resolve(User.fromJson(result)))
       .fail(result => reject(result));
    });
  }
}