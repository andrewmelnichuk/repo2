module Client.Common {

  export enum HttpMethod {GET, POST};

  export class HttpClient {
    private _url: string;
    private _method: HttpMethod;
    private _body: string;
    private _query: string;
    private _headers: Client.Common.IDictionary<string> = {};
    private _xhr: XMLHttpRequest = new XMLHttpRequest();
  
    constructor (url?: string) {
      if (url)
        this._url = url;
    }
  
    public url(url: string): HttpClient {
      this._url = url;
      return this;
    }
  
    public query(query: string): HttpClient {
      this._query = query;
      return this;
    }
  
    public header(name: string, value: string): HttpClient {
      this._headers[name] = value;
      return this;
    }
  
    public body(data: string): HttpClient {
      this._body = data;
      return this;
    }
  
    public method(method: HttpMethod): HttpClient {
      this._method = method;
      return this;
    }
  
    public call(): void {
  
      var url = this._url;
  
      if (this._query)
      url += '?' + this._query;

      var body = (this._method != HttpMethod.GET) ? this._body : undefined;

      this._xhr.open(HttpMethod[this._method], url, true);

      for (var header in this._headers)
        this._xhr.setRequestHeader(header, this._headers[header]);

      this._xhr.send(body);
      // TODO add response callback
    }
  
    public response(callback: (response: string) => void): HttpClient {
      return this;
    }
  }
}