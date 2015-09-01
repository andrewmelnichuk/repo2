///<reference path="../Models/User.ts" />
///<reference path="../Models/App.ts" />

module Client.Common {
  
  import IDictionary = Client.Common.IDictionary;
  import Dictionary = Client.Common.Dictionary;
  import Entity = Client.Models.Entity;
  import User = Client.Models.User;
  import App = Client.Models.App;

  export class EntityRepository<T extends Entity> {

    private _path: string;
    private _fromJson: (json: any) => T;
    private _data = new Dictionary<number, T>()
    private _initialized: boolean;
    public static i:number;
 
    constructor(path: string, fromJson: (json: any) => T) {
      this._path = Url.api(path);
      this._fromJson = fromJson;
    }
 
    public initialize(): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        if (this._initialized)
          resolve();
        else
          $.getJSON(this._path)
            .done(data => {
              for (var i = 0; i < data.length; i++) {
                var obj = this._fromJson(data[i]);
                this._data.add(obj.id, obj);
              }
              this._initialized = true;
              resolve();
            })
            .fail(reject);
      });
    }
 
    // public refresh(): Promise<void> {
    //   this.ensureInitialized();
    //   var rev = 0;
    //   for (var item in this._data)
    //     if (item.)
    // }
 
    public get(id: number): T {
      this.ensureInitialized();
      if (this._data[id])
        return this._data[id];
      throw new Error("Entity #" + id + " not found");
    }
 
    public all(): Array<T> {
      this.ensureInitialized();
      var result = new Array<T>();
      for (var key in this._data)
        result.push(this._data[key]);
      return result;
    }
 
    public save(entity: T): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        
      });
    }
 
    public delete(id: number): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        
      });
    }
    
    private ensureInitialized() {
      if (!this._initialized)
        throw new Error("Resource was not initialized");
    }
  }
 
  export class Model {

    public static users: Array<User> = [];
    public static apps: Array<App> = [];

    public static update(changes: Array<Entity>): void {
      var entities: Array<Entity>;

      for (var e in changes) {
        if (e instanceof User)
          entities = this.users;
        else if (e instanceof App)
          entities = this.apps;

        if (entities)
          this.applyUpdate(e, entities);
        else
          throw new Error("Can't update model, unknown entity type " + e.constructor.toString())
      }
    }

    private static applyUpdate(entity: Entity, entities: Array<Entity>) {
      var existing: Entity;

      for (var e in entities)
        if (e.id == entity.id) {
          existing = e;
          break;
        }

      if (!existing)
        entities.push(entity); // add
      else
        $.extend(true, existing, entity); // update
    }
  }

  export class Data {
    public static users = new EntityRepository<User>("/users", User.fromJson);
    public static apps = new EntityRepository<App>("/apps", App.fromJson);
  }
}