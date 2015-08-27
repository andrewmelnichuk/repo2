module Client.Commands {

  import HttpMethod = Client.Common.HttpMethod;

  export class SyncCmd extends BaseCmd {

    private _rev: number;

    constructor (rev: number) {
      super();
      this._rev = rev;
    }

    public execute() {
      new JsonCmd("/sync/index", HttpMethod.GET, undefined, {rev: this._rev})
        .done(result => {
          // update model
          this._done(result);
        })
        .fail(result => {
          this._fail(result);
        })
        .always(result => {
          this._always(result);
        })
        .execute();
    }
  
    private doSync(result: any): void {
      console.log('update model');
    }
  }
}