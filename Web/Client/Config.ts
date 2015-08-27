class Config {
  public static get apiUrl(): string {
    return this.cfg.apiUrl;
  }

  private static get cfg(): any {
    if (!window.hasOwnProperty("config"))
      throw new Error("Configuration not found");
    return window["config"];
  }
}