import React from 'react'
import PropTypes from 'prop-types'
import styles from './answerindex.less'

const defaultImg = require('@/assets/img/placeholder.png');
export default class AnswerIndex extends React.Component {
  static defaultProps = {
    onStart: PropTypes.func.isRequired,
    img: PropTypes.string
  }
  static defaultProps = {
    img: defaultImg
  }
  state = {
    imgLoadErr: false
  }
  handleImgErr = () => {
    this.setState({
      imgLoadErr: true
    })
  }
  render() {
    return (
      <div className={styles.wrap}>
        <img
          src={this.state.imgLoadErr ? defaultImg : this.props.img}
          className={styles.img}
          alt=''
          onError={this.handleImgErr}
        />
        <button className={styles.btn} onClick={this.props.onStart}>立即開始*</button>
        <p className={styles.statement}>*如未有成功註冊為01會員，香港01並不會儲存閣下任何個人資料。</p>
      </div>
    )
  }
}
