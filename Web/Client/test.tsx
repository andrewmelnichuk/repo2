///<reference path="_references.ts" />

class DemoProps {
  public name:string;
}

class UserName extends React.Component<{name: string}, any> {
  public render() {
    return (<div>{this.props.name}</div>);
  }
}

class LikeButtonState {
  liked: {
    value: boolean
  };
}

class LikeButton extends React.Component<any, LikeButtonState> {
  
  private _state:LikeButtonState = { liked: {value: false}};
  
  constructor() {
    super();
    this.state = { liked: {value: false}};
    console.log("ctor");
  }
  
  componentWillMount() {
    console.log("componentWillMount");
  }
  
  componentDidMount() {
    console.log("componentDidMount");
  }
  
  componentWillUpdate() {
    console.log("componentWillUpdate");
  }
  
  componentDidUpdate() {
    console.log("componentDidUpdate");
  }
  
  componentWillUnmount() {
    console.log("componentWillUnmount");
  }
  
  buttonClick() {
    // this.state.liked.value = !this.state.liked.value;
    // this.forceUpdate();
    this.state.liked.value = !this.state.liked.value;  
    this.setState(this.state);
  }
  
  render() {
    console.log("render");
    var txt = this.state.liked.value ? "Liked" : "Not Liked";
    return (
      <button ref="btn" onClick={this.buttonClick.bind(this)}>{txt}</button>
    );
  }
}