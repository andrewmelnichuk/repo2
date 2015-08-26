module Client.Commands {
  
  import HttpClient = Client.Common.HttpClient;
  import HttpMethod = Client.Common.HttpMethod;
  
  export class JsonCmd extends BaseCmd {
    private _client = new HttpClient();
  
    constructor(url: string, method: HttpMethod, data?: Object, query?: Object) {
      super();
  
      // create envelope
  
      this._client
          .url(Utils.apiUrl(url))
          .method(method)
          .query(Utils.toQueryString(query))
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
}