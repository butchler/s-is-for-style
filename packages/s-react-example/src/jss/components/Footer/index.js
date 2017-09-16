
import React, { Component } from 'react'
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from '../../constants/filters'
import classnames from 'classnames'
import useSheet from 'react-jss'
import styles from './style'

const FILTER_TITLES = {
  [SHOW_ALL]: 'All',
  [SHOW_ACTIVE]: 'Active',
  [SHOW_COMPLETED]: 'Completed',
}

class Footer extends Component {
  renderTodoCount() {
    const { activeCount, sheet: {classes} } = this.props
    const itemWord = activeCount === 1 ? 'item' : 'items'

    return (
      <span className={classes.count}>
        <strong className={classes.strong}>{activeCount || 'No'}</strong> {itemWord} left
      </span>
    )
  }

  renderFilterLink(filter) {
    const title = FILTER_TITLES[filter]
    const { filter: selectedFilter, onShow, sheet: {classes} } = this.props

    return (
      <a className={classnames(classes.filterLink, { [classes.filterLinkHighlight]: filter === selectedFilter })}
         style={{ cursor: 'pointer' }}
         onClick={() => onShow(filter)}>
        {title}
      </a>
    )
  }

  renderClearButton() {
    const { completedCount, onClearCompleted, sheet: {classes} } = this.props
    if (completedCount > 0) {
      return (
        <button className={classes.clearCompleted} onClick={onClearCompleted}>
          Clear completed
        </button>
      )
    }
  }

  render() {
    const {classes} = this.props.sheet;
    return (
      <footer className={classnames(classes.normal, classes.smallNormal)}>
        {this.renderTodoCount()}
        <ul className={classnames(classes.filters, classes.smallFilters)}>
          {[SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED].map(filter =>
            <li className={classes.filtersItem} key={filter}>
              {this.renderFilterLink(filter)}
            </li>
          )}
        </ul>
        {this.renderClearButton()}
      </footer>
    )
  }
}

export default useSheet(styles)(Footer)
