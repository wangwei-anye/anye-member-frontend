import React from 'react'
import PropTypes from 'prop-types'
import styles from './answeritem.less'
import * as tools from '@/utils/tools'

import { ColStyle, SelectStyle, DateStyle, MultitermSelectStyle } from './answerstyle'
import { Toast } from 'antd-mobile'

export default class AnswerItem extends React.Component {
  static propTypes = {
    current: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    question: PropTypes.string.isRequired,
    onNext: PropTypes.func.isRequired,
    onPrev: PropTypes.func.isRequired,
    answers: PropTypes.array.isRequired,
    selected: PropTypes.array.isRequired
  }

  handleSelect = selected => {
    const { type, choiceRange } = this.props
    if (type === 'LIMIT_MULTIPLE_SELECTION') {
      const max = choiceRange.split("-")[1]
      if (selected.length > max) {
        return Toast.info(`提示: 此題最多可選${max}項`)
      }
    }
    this.props.onSelect(this.props.current, selected)
  }

  renderStyle = () => {
    const selected = this.props.selected[this.props.current - 1]
    switch (this.props.type) {
      case 'SELECT':
        return (
          <SelectStyle
            items={this.props.answers}
            selected={selected || undefined}
            onSelect={this.handleSelect}
          />
        )
      case 'RADIO_SINGLE':
      case 'RADIO_DOUBLE': {
        return (
          <ColStyle
            items={this.props.answers}
            selected={selected || []}
            onSelect={this.handleSelect}
            column={this.props.type === 'RADIO_SINGLE' ? 1 : 2}
          />
        )
      }
      // NOTE: 这个 type 来自后台
      case 'MULTIPLE_SELECTION':
      case 'LIMIT_MULTIPLE_SELECTION':
        return (
          <MultitermSelectStyle
            type={this.props.type}
            items={this.props.answers || []}
            selected={selected || []}
            onSelect={this.handleSelect}
          />
        )

      case 'CUSTOM':
      case 'DATE':
        return (
          <DateStyle
            selected={selected || ['', '', '']}
            onSelect={this.handleSelect}
          />
        )
      default:
        break
    }
  }

  parseChoiceRange = () => {
    const { choiceRange } = this.props
    return choiceRange.split('-')
  }

  render() {
    const { question, type } = this.props
    const titleList = tools.transMultiLine(question.replace("↵", "\n"))
    return (
      <div className={styles.wrap}>
        <div className={styles.content}>
          <div className={styles.data}>
            {this.props.current} / {this.props.total}
          </div>
          <div className={styles.index}>
            <span className={styles.indexText}>Q{this.props.current}</span>
          </div>
          {
            titleList.map((t, index) => {
              return <p key={index} className={styles.question}>
                {t}
              </p>
            })
          }
          <p className={styles.question}>
            {
              type === 'LIMIT_MULTIPLE_SELECTION' ? `(最多可選${this.parseChoiceRange()[1]}項)` : ''
            }
          </p>
          {this.renderStyle()}
        </div>
        <div className={styles.btns}>
          <button
            className={`${styles.btn} ${styles.pre}`}
            onClick={this.props.onPrev}
          >
            上一題
          </button>
          <button
            className={`${styles.btn} ${styles.next}`}
            onClick={this.props.onNext}
          >
            {this.props.current !== this.props.total ? '下一題' : '完成'}
          </button>
        </div>
      </div>
    )
  }
}
