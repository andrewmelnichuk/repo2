module Client.Commands {
  
  export class BaseCmd {
  
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
}