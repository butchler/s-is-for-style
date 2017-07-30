import createMediaRuleRuleList from './createMediaRuleRuleList';

describe('createMediaRuleRuleList', () => {
  it('appends rule at end', () => injectRuleAndTest(
    '<h1 class="test">Test</h1>',
    (mediaRuleList) => {
      mediaRuleList.appendRuleCSS('.test { color: red; }');
      mediaRuleList.appendRuleCSS('.test { color: blue; }');

      const testElement = document.body.querySelector('.test');
      expect(window.getComputedStyle(testElement).color).to.equal('rgb(0, 0, 255)');
    }
  ));

  it('replaces rule in place', () => injectRuleAndTest(
    '<div class="a">A</div><div class="b">B</div>',
    (mediaRuleList) => {
      mediaRuleList.appendRuleCSS('.a { color: black; }');
      mediaRuleList.appendRuleCSS('.b { color: blue; }');
      mediaRuleList.appendRuleCSS('.b { color: red; }');
      mediaRuleList.replaceRuleCSS(mediaRuleList[1], '.a { color: blue; }');

      const a = document.body.querySelector('.a');
      const b = document.body.querySelector('.b');
      expect(window.getComputedStyle(a).color).to.equal('rgb(0, 0, 255)');
      expect(window.getComputedStyle(b).color).to.equal('rgb(255, 0, 0)');
    }
  ));

  it('deletes last rule', () => injectRuleAndTest(
    '<div class="a">A</div>',
    (mediaRuleList) => {
      mediaRuleList.appendRuleCSS('.a { color: black; }');
      mediaRuleList.appendRuleCSS('.a { color: blue; }');
      mediaRuleList.deleteLastRule();

      const a = document.body.querySelector('.a');
      expect(window.getComputedStyle(a).color).to.equal('rgb(0, 0, 0)');
    }
  ));
});

const injectRuleAndTest = (htmlText, testFunction) => {
  // Init document HTML and CSS
  const styleTag = document.createElement('style');
  styleTag.setAttribute('type', 'text/css');
  document.head.appendChild(styleTag);
  const cssText = '@media (min-width: 0px) {}';
  styleTag.appendChild(document.createTextNode(cssText));

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
