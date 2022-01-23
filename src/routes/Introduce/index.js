import React from "react";
import Header from "@/components/Header";
import "./index.less";

class Introduce extends React.Component {
  componentDidMount() {
    document.title = "01會員兌換教學";
    //gtm
    if (window.sdk) {
      if (window.sdk.getPlatform() !== "web") {
        window.sdk.app.fireGtmEvent("PAGE_VIEW", {
          Content: "01會員專區",
          ContentType: "01會員兌換教學",
        });
      }
    }
  }
  render() {
    return (
      <div className="p-introduce-wrap">
        <Header title="01會員兌換教學" hideMessage={true} />
        <div className="m-desc-wrap">
          <img src={require("../../assets/img/memberBg.jpg")} alt=""></img>
        </div>
      </div>
    );
  }
}
export default Introduce;
