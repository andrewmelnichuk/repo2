class Url {
  public static api (path: string): string {
    return (path.charAt(0) != '/')
      ? Config.apiUrl + '/' + path
      : Config.apiUrl + path;
  }
}

class Utils {
  public static urlEncode(data: Object): string {
    var result: string = "";
    var keys = Object.keys(data);
    for (var i = 0; i < keys.length; i++) {
      result += keys[i] + "=" + data[keys[i]];
      if (i < keys.length - 1)
        result += '&';
    }
    return result;
  }
}