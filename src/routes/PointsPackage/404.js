import React from "react";
import Header from "@/components/Header";
import "./end.less";

class PointsPackageEndNotFound extends React.Component {
  async componentDidMount() {
    document.title = "「香港01電子福袋」";
  }
  render() {
    return (
      <div className="p-right-end">
        <Header hideMessage={true} title={"香港01電子福袋"} />
        <div className="title">活動不存在</div>
      </div>
    );
  }
}
export default PointsPackageEndNotFound;
