///<reference path="../Models/User.ts" />
///<reference path="../Models/App.ts" />

module Client.Common {
  
  import IDictionary = Client.Common.IDictionary;
  
  export class Repository<T extends Models.Entity> {
    
    private _url: string;
    private _storage: IDictionary<T> = {};
    
    constructor(url: string) {
      this._url = url;
    }
    
    public get(id: number): Promise<T> {
      var entity = this._storage[id];
      return new Promise<T>((resolve, reject) => {
        if (entity)
          resolve(entity);
        else
          $.get(this._url).done(() => resolve(null));
      });
    }
    
    public get2(int: number): void {
      this.get(1).then(
        (value: T) => console.log(value),
        (error: any) => console.log("error")
      );
    }
  }
  
  import User = Client.Models.User;
  import App = Client.Models.App;
 
  export class Resource<T extends Client.Models.Entity> {
    
    private _url: string;
    private _fromJson: (json: any) => T;
    
    constructor(url: string, fromJson: (json: any) => T) {
      this._url = Url.api(url);
      this._fromJson = fromJson;
    }
    
    public getAll(): Promise<Array<T>> {
      return new Promise((resolve, reject) => {
        $.getJSON(this._url)
          .then(data => {})
          .fail(error => {});
      });
    }
    
    public get(id: number): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        $.getJSON(this._url + "/" + id)
          .then(data => resolve(this._fromJson(data)))
          .fail(error => reject(error));
      });
    }
    
    public post(entity: T): Promise<number> {
      return new Promise<number>((resolve, reject) => {
        
      });
    }
  }
  
  export class Api {
    public static Users = new Resource<User>("/users", User.fromJson);
    public static Apps = new Resource<App>("/apps", App.fromJson);
  }
}