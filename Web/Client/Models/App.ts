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
      app.id = json.Id;
      app.revision = json.Revision;
      app.name = json.Name;
      app.code = json.Code;
      app.internalId = json.InternalId;
      return app;
    }
  }
}