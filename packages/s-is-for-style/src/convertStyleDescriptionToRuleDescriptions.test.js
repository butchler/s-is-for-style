import convertStyleDescriptionToRuleDescriptions from './convertStyleDescriptionToRuleDescriptions';

test('it works', () => {
  expect(convertStyleDescriptionToRuleDescriptions('a', {
    border: '1px solid black',
    borderRadius: '5px',
    ':hover': {
      border: '1px solid red',
    },
    borderTop: '3px solid blue',
  })).toEqual([
    {
      ruleType: 'style',
      ruleKey: '.a',
      declarations: {
        border: '1px solid black',
        borderRadius: '5px',
      },
    },
    {
      ruleType: 'style',
      ruleKey: '.a:hover',
      declarations: {
        border: '1px solid red',
      },
    },
    {
      ruleType: 'style',
      ruleKey: '.a',
      declarations: {
        borderTop: '3px solid blue',
      },
    },
  ]);
});
