import shared from './../../shared/style'

export default {
  main: {
    position: 'relative',
    zIndex: 2,
    borderTop: '1px solid #e6e6e6',
  },

  normal: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },

  toggleAll: {
    ...shared.formEl,

    position: 'absolute',
    top: '-55px',
    left: '-12px',
    width: '60px',
    height: '34px',
    textAlign: 'center',
    border: 'none', /* Mobile Safari */

    '&:before': {
      content: '"❯"',
      fontSize: '22px',
      color: '#e6e6e6',
      padding: '10px 27px 10px 27px',
    },

    '&:checked:before': {
      color: '#737373',
    },
  },

  /*
    Hack to remove background from Mobile Safari.
    Can't use it globally since it destroys checkboxes in Firefox
  */
    '@media screen and (-webkit-min-device-pixel-ratio:0)': {
      toggleDevice: {
        transform: 'rotate(90deg)',
        appearance: 'none',
        '-webkit-appearance': 'none',
      },
    },

}
