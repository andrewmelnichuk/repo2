module Client.Common {

  export enum HttpMethod {GET, POST};

  export class HttpClient {
    private _url: string;
    private _method: HttpMethod;
    private _body: string;
    private _query: string;
    private _headers: IDictionary<string> = {};
    private _callbacks: IDictionary<(response: string) => void> = {};
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

    public call2(callback: (response: string) => void): void {
      
    }
    
    public call(callbacks: IDictionary<(response: string) => void>): void {
  
      var url = this._url;
  
      if (this._query)
      url += '?' + this._query;

      var body = (this._method != HttpMethod.GET) ? this._body : undefined;

      // this._xhr.onreadystatechange = (e: ProgressEvent) => {
      //   if (this._xhr.status == 200 && this._xhr.readyState == 4)
      //     callback(this._xhr.responseText);
      // };

      this._xhr.open(HttpMethod[this._method], url, true);

      for (var header in this._headers)
        this._xhr.setRequestHeader(header, this._headers[header]);

      this._xhr.send(body);
      // TODO add response callback
    }
  }
}