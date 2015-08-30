class Config {
  public static get apiUrl(): string {
    return this.cfg.apiUrl;
  }

  private static get cfg(): any {
    if (window.hasOwnProperty("config"))
      return window["config"];
    throw new Error("Configuration not found. Set window.config object.");
  }
}