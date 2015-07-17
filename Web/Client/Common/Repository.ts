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
    
    public get2(): void {
      this.get(1).then(
        (value: T) => console.log(value),
        (error: any) => console.log("error")
      );
    }
  } 
}