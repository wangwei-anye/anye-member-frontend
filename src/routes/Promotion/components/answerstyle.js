import React from 'react'
import PropTypes from 'prop-types'
import { Picker, Icon } from 'antd-mobile'
import { fixIOSKeyboardPad } from '@/utils/tools'
import styles from './answerstyle.less'

export class ColStyle extends React.Component {
  static propTypes = {
    items: PropTypes.array.isRequired,
    selected: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['single', 'multi']),
    column: PropTypes.number
  }
  static defaultProps = {
    type: 'single',
    column: 2
  }

  handleSelect = (item, active) => {
    const selected = this.props.selected || []
    let newSelected = [...selected]
    if (this.props.type === 'single') {
      newSelected = [item.id]
    } else {
      if (active) {
        newSelected.push(item.id)
      } else {
        newSelected = newSelected.filter(select => select !== item.id)
      }
    }
    this.props.onSelect(newSelected)
  }

  render() {
    const selected = this.props.selected || []
    const style = {};
    if (this.props.column === 1) {
      style.flexBasis = '100%';
    }
    return (
      <div className={styles.colStyle}>
        {this.props.items.map((item, index) => {
          const isActive =
            selected.find(select => select === item.id) !== undefined
          return (
            <div
              key={index}
              onClick={() => this.handleSelect(item, !isActive)}
              className={`${styles.colItem} ${isActive ? styles.active : ''}`}
              style={style}
            >
              {item.value || item.origin_value}
            </div>
          )
        })}

        {this.props.items.length % 2 === 0 || this.props.column === 1 ? null : (
          <div
            className={styles.colItem}
            style={{ border: 'none', opacity: 0 }}
          />
        )}
      </div>
    )
  }
}

export class SelectStyle extends React.Component {
  static propTypes = {
    items: PropTypes.array.isRequired,
    selected: PropTypes.number,
    onSelect: PropTypes.func.isRequired
  }

  handleSelect = dataText => {
    this.props.onSelect(dataText[0])
  }

  render() {
    const data = this.props.items.map(item => ({
      value: item.id,
      label: item.value || item.origin_value
    }))
    const item = data.find(item => item.value === this.props.selected) || {}
    let btnText = item.label
    let cls = styles.select;

    if (!btnText) {
      btnText = '請選擇'
      cls += ` ${styles.noselect}`;
    }
    return (
      <div className={styles.selectStyle}>
        <Picker
          extra="請選擇"
          data={data}
          cols={1}
          okText="確定"
          dismissText="取消"
          value={[this.props.selected]}
          onChange={this.handleSelect}
        >
          <button className={cls}>
            <span className={styles.selectName}>{btnText}</span>
            <Icon type="down" color="rgb(184, 184, 184)" className={styles.selectIcon} />
          </button>
        </Picker>
      </div>
    )
  }
}

class NumberInput extends React.Component {
  static propTypes = {
    style: PropTypes.string,
    pattern: PropTypes.string,
    onBlur: PropTypes.func,
    type: PropTypes.string,
    maxLength: PropTypes.number,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  }

  static defaultProps = {
    pattern: '[0-9]{0,2}',
    style: styles.inputShort,
    onBlur: () => { },
    maxLength: 2,
    type: 'day'
  }

  fixPad = () => {
    this.props.onBlur && this.props.onBlur()
    fixIOSKeyboardPad()
  }

  handleChange = e => {
    this.props.onChange(this.props.type, e.target.value)
  }

  focus() {
    this.numberInputRef.focus();
  }

  componentDidMount() {
    this.props.onRef(this)
  }

  render() {
    return (
      <input
        ref={(input) => { this.numberInputRef = input; }}
        className={this.props.style}
        onBlur={this.fixPad}
        type="tel"
        maxLength={this.props.maxLength}
        onChange={this.handleChange}
        value={this.props.value}
      />
    )
  }
}

export class DateStyle extends React.Component {
  static propTypes = {
    selected: PropTypes.any.isRequired,
    onSelect: PropTypes.func.isRequired
  }

  handleChange = (type, value) => {
    const typeMap = {
      month: 0,
      day: 1,
      year: 2
    }
    const lenMap = {
      month: 2,
      day: 2,
      year: 4
    }
    const newSelected = [...this.props.selected]
    if (value === '') {
      newSelected[typeMap[type]] = ''
    } else {
      if (!/^\d{1,4}$/.test(value) || value.length > lenMap[type]) {
        return
      } else {
        newSelected[typeMap[type]] = value
      }
    }
    if (type === "year") {
      if (value.length === 4 && this.checkYearIsValid(value)) {
        this.monthRef.focus()
      }
    } else if (type === "month") {
      if (value.length === 2 && this.checkMonthIsValid(value)) {
        this.dayRef.focus()
      }
    }
    this.props.onSelect(newSelected)
  }

  checkYearIsValid(year) {
    return year <= new Date().getFullYear() && year >= 1900
  }

  checkMonthIsValid(month) {
    return month <= 12 && month > 0
  }

  render() {
    const [month, day, year] = this.props.selected
    return (
      <div className={styles.dateStyle}>
        <div className={styles.timeLabel}>
          <span className={styles.label}>年</span>
          <span className={styles.label}>月</span>
          <span className={styles.label}>日</span>
        </div>
        <div className={styles.timeVals}>
          <NumberInput
            style={styles.inputLong}
            maxLength={4}
            value={year}
            type="year"
            onChange={this.handleChange}
            onRef={(ref) => { this.yearRef = ref }}
          />
          <span className={styles.seperator}>/</span>
          <NumberInput
            value={month}
            type="month"
            onChange={this.handleChange}
            onRef={(ref) => { this.monthRef = ref }}
          />
          <span className={styles.seperator}>/</span>
          <NumberInput
            value={day}
            type="day"
            onChange={this.handleChange}
            onRef={(ref) => { this.dayRef = ref }} />
        </div>
      </div>
    )
  }
}

// 多项选择的题型
export class MultitermSelectStyle extends React.Component {
  static propTypes = {
    items: PropTypes.array.isRequired,
    selected: PropTypes.array,
    onSelect: PropTypes.func.isRequired
  }

  handleItemClickEvent(id) {
    const selected = this.props.selected
    let newSelected = [...selected]
    let set = new Set(newSelected)
    if (set.has(id)) {
      newSelected = newSelected.filter(item => id !== item)
    } else {
      newSelected.push(id)
    }
    this.props.onSelect(newSelected)
  }

  findActiveItem(id, selected) {
    return selected.find(select => select === id) !== undefined
  }

  render() {
    const selected = this.props.selected
    const answerList = this.props.items
    const clsName = this.props.type === 'MULTIPLE_SELECTION' ?
      `${styles.answerList} ${styles.threeColumns}` : `${styles.answerList} ${styles.twoColumns}`
    return (
      <div className={styles.multitermSelectStyle}>
        <ul className={clsName}>
          {
            answerList.map((item, index) => {
              const isActive = this.findActiveItem(item.id, selected)
              const { value, origin_value: originValue } = item
              return <li
                key={index}
                className={`${styles.item} ${isActive ? styles.active : ''}`}
                onClick={this.handleItemClickEvent.bind(this, item.id)}
              >{value || originValue}</li>
            })
          }
          {answerList.length % 2 === 0 || answerList.length === 1 ? null : (
            <li
              className={styles.item}
              style={{ border: 'none', opacity: 0 }}
            />
          )}

        </ul>
      </div>
    )
  }
}

