class Utils {
  public static toQueryString(data: Object): string {
    var result: string;
    var i = 0, keys = Object.keys(data);
    for (var key in keys) {
      result += key + "=" + data[key];
      if (i < keys.length - 1)
        result += '&';
    }
    return result;
  }

  public static apiUrl(path: string): string {
    return (path.charAt(0) != '/')
      ? '/' + Config.apiUrl
      : Config.apiUrl;
  }
}