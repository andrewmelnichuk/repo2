///<reference path="../Common/HttpClient.ts"/>

module Client.Commands {

  import HttpClient = Client.Common.HttpClient;
  import HttpMethod = Client.Common.HttpMethod;

  export class JsonCmd extends BaseCmd {

    private _client = new HttpClient(); 

    constructor(url: string, method: HttpMethod, data?: Object, query?: Object) {
      super();
      
      // create envelope
      this._client.url(Url.api(url));
      this._client.method(method);
      this._client.query(Utils.urlEncode(query));

      if (data) {
        this._client.body(JSON.stringify(data));
        this._client.header("Content-Type", "application/json");
      }
    }

    public execute(): void {
      //this._client.call(this.response);
    }

    private response(body: string): void {
      // deserealize and process envelope
      console.log(body);
      // var code;
      // if (code == 200)
      //   this._done({});
      // else if (code != 500)
      //   this._fail({});
      // this._always({});
    }
  }
}