import convertStyleDescriptionToRuleDescriptions from './convertStyleDescriptionToRuleDescriptions';

describe('convertStyleDescriptionToRuleDescriptions', () => {
  it('creates separate style rules in original order', () => {
    expect(convertStyleDescriptionToRuleDescriptions('a', {
      border: '1px solid black',
      borderRadius: '5px',
      ':hover': {
        border: '1px solid red',
      },
      borderTop: '3px solid blue',
    })).to.eql([
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

  it('supports @media rules', () => {
    expect(convertStyleDescriptionToRuleDescriptions('test', {
      color: 'red',
      '@media (min-width: 500px)': {
        color: 'green',
      },
      '@media (min-width: 1000px)': {
        color: 'blue',
      },
    })).to.eql([
      {
        ruleType: 'style',
        ruleKey: '.a',
        declarations: {
          color: 'red',
        },
      },
      {
        ruleType: 'media',
        ruleKey: '@media (min-width: 500px)',
        childRuleDescriptions: [
          {
            ruleType: 'style',
            ruleKey: '.a',
            declarations: {
              color: 'green',
            },
          },
          {
            ruleType: 'style',
            ruleKey: '.a',
            declarations: {
              color: 'blue',
            },
          },
        ],
      },
    ]);
  });
});
