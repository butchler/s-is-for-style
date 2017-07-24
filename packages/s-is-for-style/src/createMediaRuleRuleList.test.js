import createMediaRuleRuleList from './createMediaRuleRuleList';

describe('createMediaRuleRuleList', () => {
  it('appends rule at end', () => injectRuleAndTest(
    '@media (min-width: 0px) { .test { color: red; } }',
    '<h1 class="test">Test</h1>',
    (mediaRuleList) => {
      const testElement = document.body.querySelector('.test');
      mediaRuleList.appendRuleCSS('.test { color: blue; }');
      expect(window.getComputedStyles(testElement).color).to.equal('blue');
    }
  ));

  it('replaces rule in place', () => injectRuleAndTest(
    '@media (min-width: 0px) { .a { color: black; } .b { color: blue } .b { color: red; } }',
    '<div class="a">A</div><div class="b">B</div>',
    (mediaRuleList) => {
      const a = document.body.querySelector('.a');
      const b = document.body.querySelector('.b');
      mediaRuleList.replaceRuleCSS(mediaRuleList[1], '.a { color: blue; }');
      expect(window.getComputedStyles(a).color).to.equal('blue');
      expect(window.getComputedStyles(b).color).to.equal('red');
    }
  ));

  it('deletes last rule', () => injectRuleAndTest(
    '@media (min-width: 0px) { .a { color: black; } .a { color: blue } }',
    '<div class="a">A</div>',
    (mediaRuleList) => {
      const a = document.body.querySelector('.a');
      mediaRuleList.deleteLastRule();
      expect(window.getComputedStyles(a).color).to.equal('black');
    }
  ));
});

const injectRuleAndTest = (cssText, htmlText, testFunction) => {
  // Init document HTML and CSS
  const styleTag = document.createElement('style');
  styleTag.setAttribute('type', 'text/css');
  document.head.appendChild(styleTag);
  styleTag.sheet.cssText = cssTest;

  document.body.innerHTML = htmlText;

  // Assume that first rule is a media rule.
  const nativeMediaRule = styleTag.sheet.cssRules[0];
  const mediaRuleList = createMediaRuleRuleList(nativeMediaRule);

  // Run test
  testFunction(mediaRuleList);

  // Reset document
  document.head.removeChild(styleTag);
  document.body.innerHTML = '';
};
