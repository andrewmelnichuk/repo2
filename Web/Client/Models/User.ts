module Client.Models {

  @model("models.User")
  export class User extends Entity {
    @property
    public login: string;

    @property
    public password: string;

    @property
    public firstName: string;

    @property
    public lastName: string;

    public static fromJson(json: any): User {
      var u = new User();
      u.login = json.Login;
      u.password = json.Password;
      u.firstName = json.FirstName;
      u.lastName = json.LastName;
      return u;
    }
  }
}