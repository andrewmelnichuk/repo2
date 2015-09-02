///<reference path="../Models/User.ts" />
///<reference path="../Models/App.ts" />

module Client.Common {
  
  import Dictionary = Client.Common.Dictionary;
  import Entity = Client.Models.Entity;
  import User = Client.Models.User;
  import App = Client.Models.App;

  export class EntityRepository<T extends Entity> {

    private _url: string;
    private _revision: number = 0;
    private _fromJson: (json: any) => T;
    private _data = new Dictionary<number, T>()
    private _initialized: boolean;
 
    constructor(path: string, fromJson: (json: any) => T) {
      this._url = Url.api(path);
      this._fromJson = fromJson;
    }
 
    public initialize(): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        if (this._initialized)
          resolve();
        else
          $.getJSON(this._url)
            .done(data => {
              this.updateData(data);
              this._initialized = true;
              resolve();
            })
            .fail(reject);
      });
    }
 
    public refresh(): Promise<void> {
      this.ensureInitialized();
      return new Promise<void>((resolve, reject) => {
        $.getJSON(this._url + "?rev=" + this._revision)
         .done(response => {
           this.updateData(response);
           resolve();
         })
         .fail(reject);
      });
    }
 
    public get(id: number): T {
      this.ensureInitialized();
      if (this._data[id])
        return this._data[id];
      throw new Error("Entity #" + id + " not found");
    }
 
    public all(): Array<T> {
      this.ensureInitialized();
      return this._data.values();
    }
 
    public save(entity: T): Promise<number> {
      return new Promise<number>((resolve, reject) => {
        var url = this._url + (entity.id > 0) ? ("/" + entity.id) : "";
        $.ajax(url + "?rev=" + this._revision, {
           data: JSON.stringify(entity),
           contentType: "application/json",
           dataType: "JSON",
           method: "POST"})
         .done(response => {
           this.updateData(response.Updates);
           resolve(response.Data);
         })
         .fail(reject);
      });
    }
 
    public delete(id: number): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        $.ajax(this._url + "/" + id + "?rev=" + this._revision, { 
           dataType: "JSON", 
           method: "DELETE" })
         .done(response => {
           this.updateData(response.Updates);
           resolve(response.Data);
         })
         .fail(reject);
      });
    }
    
    private updateData(json: any) {
      for (var i = 0; i < json.length; i++) {
        var obj = this._fromJson(json[i]);

        if (this._data.containsKey(obj.id))
          this._data[obj.id] = obj;
        else
          this._data.add(obj.id, obj);

        if (obj.revision > this._revision)
          this._revision = obj.revision;
      }
    }

    private ensureInitialized() {
      if (!this._initialized)
        throw new Error("Repository was not initialized");
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