import { browser, by, element, WebElement, ElementArrayFinder } from 'protractor';

export class AppPage {
  navigateTo(): Promise<unknown> {
    return browser.get(browser.baseUrl) as Promise<unknown>;
  }

  getTitleText(): Promise<string> {
    return element(by.className('app-title')).getText() as Promise<string>;
  }

  getSearchInput(): Promise<string> {
    return element(by.name('search')).getText() as Promise<string>;
  }

  getSortInput(): Promise<string> {
    return element(by.name('sort')).getTagName() as Promise<string>;
  }

  getFeedCardTitles(): ElementArrayFinder {
    return element.all(by.tagName('app-feed-card')).all(by.tagName('h3'));
  }

  getFeedCard(): ElementFinder {
    return element(by.tagName('app-feed-card'));
  }


  getSearchWebElement(): WebElement {
    return element(by.name('search'));
  }

  getSortWebElement(optionId: string): WebElement {
    return element(by.id(optionId));
  }

  getPageInputWebElement(): WebElement {
    return element(by.id('pageInput'));
  }

  getJumpToPageButton(): WebElement {
    return element(by.id('jumpTo'));
  }

}
