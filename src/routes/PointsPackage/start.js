import React from "react";
import { connect } from "dva";
import Header from "@/components/Header";
import { getPackageInfoDetail } from "@/services/index";
import moment from "moment";
import "./start.less";

class PointsPackageStart extends React.Component {
  constructor(props) {
    super();
    this.state = {
      info: {}
    };
  }
  async componentDidMount() {
    document.title = "「香港01電子福袋」";
    const id = this.props.match.params.id;
    const {
      data: { data }
    } = await getPackageInfoDetail(id);
    this.setState({
      info: data
    });
  }

  render() {
    const {
      package_name,
      copywriting_before_activity,
      navigation_title,
      start_time,
      front_status
    } = this.state.info;
    const startTime = moment(start_time).format("YYYY-MM-DD HH:mm");
    const isStart = moment(start_time).isBefore();

    return (
      <div className="p-right-start">
        <Header hideMessage={true} title={navigation_title} />
        <div className="title">{package_name}</div>
        <div className="des">活動尚未開始</div>
        {front_status === 1 && isStart ? (
          <div className="time">即將開始，敬請期待</div>
        ) : (
          <div>
            <div className="time">活動開始日期：{startTime}</div>
            <div className="txt">{copywriting_before_activity}</div>
          </div>
        )}
      </div>
    );
  }
}
export default connect(({ system, auth }) => {
  return {
    system: system.toJS(),
    auth: auth.toJS()
  };
})(PointsPackageStart);
