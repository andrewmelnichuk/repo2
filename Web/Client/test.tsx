///<reference path="_references.ts" />

class DemoProps {
  public name:string;
}

class UserName extends React.Component<{name: string}, any> {
  public render() {
    return (<div>{this.props.name}</div>);
  }
}

class MyComponent extends React.Component<DemoProps, any> {
  private foo:number;
  constructor(props:DemoProps) {
    super(props);
    this.foo = 42;
  }
  render() {
    return (
      <div>Hello world! <UserName name="Andrew"/></div>
    );
  }
}