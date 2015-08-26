module Client.Commands {

  import HttpMethod = Client.Common.HttpMethod;

  export class SyncCmd extends BaseCmd {
  
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
}