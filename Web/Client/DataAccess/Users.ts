module DataAccess {
  export class Users {
    
    private i: number;
    public c: number;
    
    public Save(): void {
      console.log("User saved.");
    }
    
    public static Fn():void {
      console.log("static fn");
    }
    
    public SetI(val: number): void {
      this.i = val;
    }
    
    public SetC(val: number): void {
      this.c = val;
    }
  }
}