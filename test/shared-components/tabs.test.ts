import { JSDOM } from 'jsdom';
import { tabs } from '../../src/shared-components/tabs';
import { arbitraryHtmlFragment, arbitraryString, arbitraryUri } from '../helpers';

describe('tabs', () => {
  it('shows an active tab label', () => {
    const tabLabel = arbitraryString();
    const rendered = JSDOM.fragment(tabs(arbitraryHtmlFragment(), arbitraryUri(), tabLabel, arbitraryString()));
    const activeTab = rendered.querySelector('[role=tab][aria-selected=true]');

    expect(activeTab?.textContent).toStrictEqual(tabLabel);
  });

  it('active tab is not a link', () => {
    const rendered = JSDOM.fragment(
      tabs(
        arbitraryHtmlFragment(),
        arbitraryUri(),
        arbitraryString(),
        arbitraryString(),
      ),
    );
    const activeTab = rendered.querySelector('[role=tab][aria-selected=true]');

    expect(activeTab?.tagName).not.toStrictEqual('A');
  });

  it('shows inactive tab as link', () => {
    const inactiveTabTarget = arbitraryUri();
    const rendered = JSDOM.fragment(
      tabs(
        arbitraryHtmlFragment(),
        inactiveTabTarget,
        arbitraryString(),
        arbitraryString(),
      ),
    );
    const inactiveTab = rendered.querySelector('[role="tab"]:not([aria-selected=true])');

    expect(inactiveTab?.tagName).toStrictEqual('A');
    expect(inactiveTab?.getAttribute('href')).toStrictEqual(inactiveTabTarget);
  });

  it('shows the correct label for inactive tab', () => {
    const inactiveTabLabel = arbitraryString();
    const rendered = JSDOM.fragment(tabs(arbitraryHtmlFragment(), arbitraryUri(), arbitraryString(), inactiveTabLabel));
    const inactiveTab = rendered.querySelector('[role="tab"]:not([aria-selected=true])');

    expect(inactiveTab?.textContent).toStrictEqual(inactiveTabLabel);
  });

  it.todo('orders tabs independently of active state');

  it('shows the content in the tab panel', () => {
    const content = arbitraryHtmlFragment();
    const rendered = JSDOM.fragment(tabs(content, arbitraryUri(), arbitraryString(), arbitraryString()));
    const tabPanelContent = rendered.querySelector('[role="tabpanel"]');

    expect(tabPanelContent?.innerHTML.trim()).toStrictEqual(content);
  });
});
