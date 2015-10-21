///<reference path="../_references.ts" />

module Client.Views {

  export class ManageView extends React.Component<any, any> {

    public render() {
      return (
        <div>
          {/*
          <div className="preloader">
            <img src="img/devoops_getdata.gif" className="devoops-getdata" alt="preloader"/>
          </div>
          */}
          <div id="ajax-content">
            This is Manage view
          </div>
        </div>  
      );
    }
    
    public componentWillUnmount() {
      console.log("Unmount!!!!");
    }
  }
}