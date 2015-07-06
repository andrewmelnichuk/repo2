module Models {
 
  @model("models.Model")
  export class User {
    @property
    public firstName: string;
    
    @property
    public lastName: string;
    
    @property
    public age: number;
   
    @property
    public orders: List<Order> = new List<Order>();
  } 
  
  export  class List<T> {
    private _items: Array<T> = [];
  
    public add(item: T): void {
      this._items.push(item);
    }
  }
}