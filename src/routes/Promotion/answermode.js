import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import dayjs from 'dayjs'
import AnswerIndex from './components/answerindex'
import AnswerItem from './components/answeritem'
import styles from './answermode.less'
import { Toast, Modal } from 'antd-mobile'
import * as tools from '@/utils/tools'

const alert = Modal.alert;

@connect(({ auth, system }) => ({
  system: system.toJS(),
  auth: auth.toJS()
}))
export default class AnswerMode extends React.Component {
  static propTypes = {
    activityInfo: PropTypes.object.isRequired,
    scrollToTop: PropTypes.func.isRequired,
    onAlert: PropTypes.func.isRequired
  }
  state = {
    current: 0,
    activityData: [],
    selected: []
  }

  componentWillUnmount() {
    Toast.hide()
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { userInfo: { isGeting } } = nextProps.auth
    // NOTE: 这个 flag 标示通过 sdk 获取用户信息是否结束
    if (!isGeting) {
      Toast.hide()
    }
  }

  handleStart = () => {
    const { activityInfo, scrollToTop } = this.props
    const { questionInfo } = activityInfo
    const { userInfo: { isGeting } } = this.props.auth

    // 回到顶部
    scrollToTop && scrollToTop();

    // NOTE: 这个 flag 标示通过 sdk 获取用户信息是否结束
    if (isGeting) {
      Toast.loading("加載中", 0)
      return
    }
    // 如果没有配置答题
    if (!questionInfo.count) {
      Toast.offline('該活動未配置答題信息!')
      return
    }
    this.setState({
      current: this.state.current + 1
    })
    this.props.dispatch({
      type: 'promotion/dataTrackerDispatch',
      payload: {
        action: 'click_start'
      }
    })
  }

  renderItem = () => {
    const { activityInfo } = this.props
    const { questionInfo } = activityInfo
    // if (!questionInfo.count) {
    //   return
    // }
    if (this.state.current === 0) {
      return (
        <AnswerIndex
          onStart={this.handleStart}
          img={activityInfo.question_image}
        />
      )
    }
    const total = questionInfo.count
    const itemData = questionInfo.list[this.state.current - 1]
    return (
      <AnswerItem
        current={this.state.current}
        total={total}
        type={itemData.alias_style}
        question={itemData.value || itemData.origin_value}
        choiceRange={itemData.choice_range}
        selected={this.state.selected}
        answers={itemData.option || []}
        onPrev={this.handlePrev}
        onNext={this.handleNext}
        onSelect={this.handleSelect}
      />
    )
  }

  handleSelect = (current, answer) => {
    const newSelected = [...this.state.selected]
    newSelected[current - 1] = answer
    this.setState({
      selected: newSelected
    })
  }

  alertTip = async () => {
    await this.handleAlert(true)
    alert('提示', '必須填妥所有答題以繼續程序', [
      { text: '繼續', onPress: async () => {
        await this.handleAlert(false) }
      },
    ]);
  }

  handleAlert = async (open) => {
    await this.props.onAlert(open)
  }

  handleNext = async () => {
    const total = this.props.activityInfo.questionInfo.count
    const { activityInfo, scrollToTop } = this.props
    const { questionInfo: { list }, id } = activityInfo
    const { current, selected } = this.state
    const currentSelected = selected[current - 1]
    const currentQuestion = list[current - 1]
    // 由于目前 selected 只存有 2种数据格式，一个是 array 一个 是 number类型
    if (Array.isArray(currentSelected)) {
      if (currentSelected.some(i => !i)) {
        if (current === total) {
          this.alertTip()
        } else {
          Toast.info('請填妥答題以繼續程序', 2)
        }
        return
      }
      // 如果当前的选择没有数据, 就 return
      if (currentSelected.length === 0) {
        if (current === total) {
          this.alertTip()
        } else {
          Toast.info('請填妥答題以繼續程序', 2)
        }
        return
      }
      // 判断日期是否合法
      if (
        currentQuestion.alias_style === 'DATE' ||
        currentQuestion.alias_style === 'CUSTOM'
      ) {
        const date = this.normalizeDate(currentSelected)
        // NOTE: dayjs isValid 这个方法实质是使用 new Date("year/month/date").toString() 这中方式来检查时间是否是正确
        // 说明这个方法不会检查时间是否合法: 1-1-1 这样的时间就无法检查
        if (
          !dayjs(date.join('/')).isValid() ||
          !this.checkDateListIsValid(date)
        ) {
          Toast.info('請填妥答題以繼續程序', 2)
          return
        }
      }
    } else {
      if (!currentSelected) {
        if (current === total) {
          this.alertTip()
        } else {
          Toast.info('請填妥答題以繼續程序', 2)
        }
        return
      }
    }
    if (this.state.current === total) {
      // 提交答案
      const answerList = this.formatQuestionAnswer(this.state.selected)
      if (this.props.system.query.isPreview !== 'true') {
        await this.props.dispatch({
          type: 'promotion/postQuestionAnswer',
          payload: {
            activity_id: id,
            answer: answerList
          }
        })
      }
      // 切換singlemode
      await this.props.dispatch({
        type: 'promotion/switchMode',
        mode: 1
      })
      return
    }
    // NOTE: 点击下一题的时候, 会到顶部, 点击完成按钮时, 由于切换了组件, 这里进入到 singlemode 这个组件对应的页面之后在回到顶部,
    // 解决在页面过渡的时候的闪动现象
    scrollToTop()
    this.setState({
      current: this.state.current + 1
    })
  }

  normalizeDate(dateList) {
    const copySeleced = [...dateList]
    let m = copySeleced[0]
    copySeleced[0] = copySeleced[1]
    copySeleced[1] = m
    return copySeleced.reverse()
  }

  checkDateListIsValid(date) {
    const [year, month, day] = date
    if (!this.checkYearIsValid(year)) {
      return false
    }
    if (!this.checkMonthIsValid(month)) {
      return false
    }
    if (!this.checkDayIsValid(year, month, day)) {
      return false
    }
    return true
  }

  checkMonthIsValid(month) {
    return month <= 12 && month > 0
  }

  checkDayIsValid(year, month, day) {
    const currentMonthDays = this.getCurrentMonthTotalDays(year, month)
    return day <= currentMonthDays && day > 0
  }

  checkYearIsValid(year) {
    return year <= new Date().getFullYear() && year >= 1900
  }

  getCurrentMonthTotalDays(year, month) {
    var d = new Date(year, month, 0);
    return d.getDate();
  }


  handlePrev = () => {
    if (this.state.current === 1) {
      Toast.info('這是第一題, 請填妥答題以繼續程序', 2);
      return
    }
    this.props.scrollToTop()
    this.setState({
      current: this.state.current - 1
    })
  }

  formatQuestionAnswer(arr) {
    const { list } = this.props.activityInfo.questionInfo
    const result = arr.map((item, index) => {
      const obj = {}
      const { alias_style, option } = list[index]
      if (alias_style === 'DATE' || alias_style === 'CUSTOM') {
        obj.question_id = option[0].question_id
        obj.question_option_id = option[0].id
        obj.question_option_value = this.normalizeDate(item).join('-')
      }
      if (alias_style === 'SELECT') {
        const currentOption = option.filter(t => t.id === item)
        obj.question_id = currentOption[0].question_id
        obj.question_option_id = currentOption[0].id
        obj.question_option_value =
          currentOption[0].value || currentOption[0].origin_value
      }
      // TODO 由于目前没有多选的情况，这个没有处理 多选问题
      if (alias_style === 'RADIO_SINGLE' || alias_style === 'RADIO_DOUBLE') {
        const currentOption = option.filter(t => t.id === item[0])
        obj.question_id = currentOption[0].question_id
        obj.question_option_id = currentOption[0].id
        obj.question_option_value =
          currentOption[0].value || currentOption[0].origin_value
      } else if (alias_style === "MULTIPLE_SELECTION" || alias_style === 'LIMIT_MULTIPLE_SELECTION') {
        return this.normalizeMultipleSelectOptions(item, option)
      }
      return obj
    })
    // 由于存在多项选择, 那么得到的数组可能会是一个二维的数组, 这里需要将其扁平化
    return this.flatten(result)
  }

  normalizeMultipleSelectOptions(item, option) {
    return item.map((id) => {
      let res = {}
      const opt = option.filter((opt) => {
        return opt.id === id
      })[0]
      res.question_id = opt.question_id
      res.question_option_id = opt.id
      res.question_option_value = opt.value || opt.origin_value
      return res
    })
  }

  // 扁平化数组
  flatten(arr) {
    while (arr.some(item => Array.isArray(item))) {
      arr = [].concat(...arr);
    }
    return arr;
  }

  render() {
    let { main_title: mainTitle } = this.props.activityInfo
    const titleList = tools.transMultiLine(mainTitle.replace("↵", "\n"))
    return (
      <div className={styles.title}>
        {
          titleList.map((t, index) => {
            return <h3 key={index} className={styles.title}>
              {t}
            </h3>
          })
        }
        {/* <p className={styles.subTitle}>完成答題遊戲，即可獲得專享優惠券</p> */}
        {this.renderItem()}
      </div>
    )
  }
}
