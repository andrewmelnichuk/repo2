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

  SyncCmd.get(1).then(user => console.log(user));
  var httpClient = new HttpClient("http://localhost:5004/api/users/1")
    .method(HttpMethod.Post)
    .call();
};

import User = Client.Models.User;

enum HttpMethod {Get, Post};
enum HttpBodyFormat {UrlEncoded, Json};

class HttpClient {
  private _url: string;
  private _query: Object;
  private _method: HttpMethod;
  private _bodyData: Object;
  private _bodyFormat: HttpBodyFormat;
  private _xhr: XMLHttpRequest = new XMLHttpRequest();

  constructor (url: string) {
    this._url = url;
  }

  public method(method: HttpMethod): HttpClient {
    this._method = method;
    return this;
  }

  public query(params: Object): HttpClient {
    this._query = params;
    return this;
  }

  public body(format: HttpBodyFormat, data: Object): HttpClient {
    this._bodyData = data;
    this._bodyFormat = format;
    return this;
  }

  public done(callback: (response: string) => void): HttpClient {
    return this;
  }

  public fails(callback: (response: string) => void): HttpClient {
    return this;
  }
  
  public call(): void {
    this._xhr.open(HttpMethod[this._method], this._url, true);
    if (this._method == HttpMethod.Get)
      this._xhr.send();
    else if (this._method == HttpMethod.Post)
      this._xhr.send(JSON.stringify(this._query));
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

class BaseCmd {
  constructor(url: string) {
    
  }
  
  private _success: (result: any) => void;
  
  public success(callback: (result: any) => void): void {
    this._success = callback;
  }
  
  public fail(callback: (result: any) => void): void {
    
  }
  
  public execute(): void {
    $.getJSON("")
      .done(this.onSuccess);
  }
  
  protected onSuccess(result: any): void {
    if (this._success)
      this._success(result);
  }
}

class SyncCmd extends BaseCmd {
  private _rev: number;

  constructor (rev: number) {
    super(Url.api("/sync/index?rev="));
    this._rev = rev;
  }

  protected onSuccess(result: any): void {
    console.log('update model');
    super.onSuccess (result);
  }

  public execute() {
    new HttpClient("/sync/index")
    .query({rev: this._rev})
    .method(HttpMethod.Get)
    .done(this.doSync)
    .call();
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