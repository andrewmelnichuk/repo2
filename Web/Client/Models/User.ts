module Models {
 
  @model("models.User")
  export class User extends Models.Entity {
    @property
    public login: string;
    
    @property
    public password: string;
    
    @property
    public firstName: string;
    
    @property
    public lastName: string;
  }
}