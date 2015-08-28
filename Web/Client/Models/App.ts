///<reference path="Entity.ts"/>

module Client.Models {

  @model("models.App")
  export class App extends Entity {
    @property
    public name: string;

    @property
    public code: string;

    @property
    public internalId: number;

    public static fromJson(json: any): App {
      var app = new App();
      app.name = json.name;
      app.code = json.code;
      app.internalId = json.internalId;
      return app;
    }
  }
}