import React, { Component } from 'react'
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from '../../constants/filters'
import S from 's-react-styletron'
import shared from './../../shared/style'

const FILTER_TITLES = {
  [SHOW_ALL]: 'All',
  [SHOW_ACTIVE]: 'Active',
  [SHOW_COMPLETED]: 'Completed',
}

class Footer extends Component {
  renderTodoCount() {
    const { activeCount } = this.props
    const itemWord = activeCount === 1 ? 'item' : 'items'

    const count = {
      float: 'left',
      'text-align': 'left',
    };

    const strong = {
      'font-weight': 300,
    };

    return (
      <S tag="span" style={count}>
        <S tag="strong" style={strong}>{activeCount || 'No'}</S> {itemWord} left
      </S>
    )
  }

  renderFilterLink(filter) {
    const title = FILTER_TITLES[filter]
    const { filter: selectedFilter, onShow } = this.props

    const filterLinkHighlight = 'rgba(175, 47, 47, 0.1)';

    const filterLink = {
      color: 'inherit',
      margin: '3px',
      padding: '3px 7px',
      'text-decoration': 'none',
      border: '1px solid transparent',
      'border-radius': '3px',
      cursor: 'pointer',

      'border-color': filter === selectedFilter ? filterLinkHighlight : 'transparent',

      ':hover': {
        'border-color': filterLinkHighlight,
      },
    };

    return (
      <S tag="a" style={filterLink}
         onClick={() => onShow(filter)}>
        {title}
      </S>
    )
  }

  renderClearButton() {
    const { completedCount, onClearCompleted } = this.props
    if (completedCount > 0) {

      const clearCompleted = {
        ...shared.button,
        ...shared.formEl,

        float: 'right',
        'line-height': '20px',
        'text-decoration': 'none',
        cursor: 'pointer',
        visibility: 'hidden',
        position: 'relative',

        ':active': {
          float: 'right',
          'line-height': '20px',
          'text-decoration': 'none',
          cursor: 'pointer',
          visibility: 'hidden',
          position: 'relative',
        },

        ':after': {
          visibility: 'visible',
          content: '"Clear completed"',
          position: 'absolute',
          right: 0,
          'white-space': 'nowrap',
        },

        ':hover:after': {
          'text-decoration': 'underline',
        },
      };

      return (
        <S tag="button" style={clearCompleted} onClick={onClearCompleted}>
          Clear completed
        </S>
      )
    }
  }

  render() {
    const NARROW_BREAKPOINT = '@media (max-width: 430px)';

    const normal = {
      color: '#777',
      padding: '10px 15px',
      height: '20px',
      'text-align': 'center',
      'border-top': '1px solid #e6e6e6',

      ':before': {
        content: '""',
        position: 'absolute',
        right: 0,
        bottom: 0,
        left: 0,
        height: '50px',
        overflow: 'hidden',
        'box-shadow': '0 1px 1px rgba(0, 0, 0, 0.2), 0 8px 0 -3px #f6f6f6, 0 9px 1px -3px rgba(0, 0, 0, 0.2), 0 16px 0 -6px #f6f6f6, 0 17px 2px -6px rgba(0, 0, 0, 0.2)',
      },

      [NARROW_BREAKPOINT]: {
        height: '50px',
      },
    };

    const filters = {
      margin: 0,
      padding: 0,
      'list-style': 'none',
      position: 'absolute',
      right: 0,
      left: 0,

      [NARROW_BREAKPOINT]: {
        bottom: '10px',
      },
    };

    const filtersItem = {
      display: 'inline',
    };

    return (
      <S tag="footer" style={normal}>
        {this.renderTodoCount()}
        <S tag="ul" style={filters}>
          {[SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED].map(filter =>
            <S tag="li" style={filtersItem} key={filter}>
              {this.renderFilterLink(filter)}
            </S>
          )}
        </S>
        {this.renderClearButton()}
      </S>
    )
  }
}

export default Footer;
