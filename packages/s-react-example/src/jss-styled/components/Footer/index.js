import React, { Component } from 'react'
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from '../../constants/filters'
import shared from './../../shared/style'
import { styled } from 'jss-styled';

const FILTER_TITLES = {
  [SHOW_ALL]: 'All',
  [SHOW_ACTIVE]: 'Active',
  [SHOW_COMPLETED]: 'Completed',
}

class Footer extends Component {
  renderTodoCount() {
    const { activeCount } = this.props
    const itemWord = activeCount === 1 ? 'item' : 'items'

    return (
      <Count>
        <Strong>{activeCount || 'No'}</Strong> {itemWord} left
      </Count>
    )
  }

  renderFilterLink(filter) {
    const title = FILTER_TITLES[filter]
    const { filter: selectedFilter, onShow } = this.props

    return (
      <FilterLink isSelected={filter === selectedFilter}
         onClick={() => onShow(filter)}>
        {title}
      </FilterLink>
    )
  }

  renderClearButton() {
    const { completedCount, onClearCompleted } = this.props
    if (completedCount > 0) {

      return (
        <ClearButton onClick={onClearCompleted}>
          Clear completed
        </ClearButton>
      )
    }
  }

  render() {

    return (
      <FooterContainer>
        {this.renderTodoCount()}
        <Filters>
          {[SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED].map(filter =>
            <FiltersItem key={filter}>
              {this.renderFilterLink(filter)}
            </FiltersItem>
          )}
        </Filters>
        {this.renderClearButton()}
      </FooterContainer>
    )
  }
}

export default Footer;

const Count = styled('span', {
  float: 'left',
  'text-align': 'left',
});

const Strong = styled('strong', {
  'font-weight': 300,
});

const filterLinkHighlight = 'rgba(175, 47, 47, 0.1)';

const FilterLink = styled('a', {
  color: 'inherit',
  margin: '3px',
  padding: '3px 7px',
  'text-decoration': 'none',
  border: '1px solid transparent',
  'border-radius': '3px',
  cursor: 'pointer',
  'border-color': 'transparent',

  ':hover': {
    'border-color': filterLinkHighlight,
  },
}, [props => props.isSelected, {
  'border-color': filterLinkHighlight,
}]);

const ClearButton = styled('button', {
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
});

const NARROW_BREAKPOINT = '@media (max-width: 430px)';

const FooterContainer = styled('footer', {
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
});

const Filters = styled('ul', {
  margin: 0,
  padding: 0,
  'list-style': 'none',
  position: 'absolute',
  right: 0,
  left: 0,

  [NARROW_BREAKPOINT]: {
    bottom: '10px',
  },
});

const FiltersItem = styled('li', {
  display: 'inline',
});
