///<reference path="../_references.ts" />

module Client.Views {

  export class ModalBox extends React.Component<any, any> {

    public render() {
      return (
        <div id="modalbox">
          <div className="devoops-modal">
            <div className="devoops-modal-header">
              <div className="modal-header-name">
                <span>Basic table</span>
              </div>
              <div className="box-icons">
                <a className="close-link">
                  <i className="fa fa-times"></i>
                </a>
              </div>
            </div>
            <div className="devoops-modal-inner">
            </div>
            <div className="devoops-modal-bottom">
            </div>
          </div>
        </div>
      );
    }
  }
}