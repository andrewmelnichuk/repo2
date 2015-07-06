module Models {
 
  @model("models.Order")
  export class Order {
    @property
    public num: number;
    
    public items: Array<any>;
    public time: Date;
  }
}