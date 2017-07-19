import convertStylesObjectToRuleDescriptionList from './convertStylesObjectToRuleDescriptionList';

test('it works', () => {
  expect(convertStylesObjectToRuleDescriptionList({
    border: '1px solid black',
    borderRadius: '5px',
    ':hover': {
      border: '1px solid red',
    },
    borderTop: '3px solid blue',
  })).toEqual([
    {
      type: 'style',
      pseudoSelector: '',
      declarations: {
        border: '1px solid black',
        borderRadius: '5px',
      },
    },
    {
      type: 'style',
      pseudoSelector: ':hover',
      declarations: {
        border: '1px solid red',
      },
    },
    {
      type: 'style',
      pseudoSelector: '',
      declarations: {
        borderTop: '3px solid blue',
      },
    },
  ]);
});
