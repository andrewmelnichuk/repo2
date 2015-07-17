module Client.Models {
  
  import IDictionary = Client.Common.IDictionary;
  
  export class Data {
    public static Users: IDictionary<User> = {}; 
  }
}