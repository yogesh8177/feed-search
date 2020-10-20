import { browser, by, element, WebElement, ElementArrayFinder, ElementFinder, protractor } from 'protractor';
let EC = protractor.ExpectedConditions;

export class AppPage {

  isClickable (element) {
    return EC.elementToBeClickable(element);
  }

  isVisible (element) {
    return EC.visibilityOf(element);
  }

  navigateTo(): Promise<unknown> {
    return browser.get(browser.baseUrl) as Promise<unknown>;
  }

  getTitleText(): Promise<string> {
    return element(by.className('app-title')).getText() as Promise<string>;
  }

  getPageStatusText(): Promise<string> {
    return element(by.className('page-status')).getText() as Promise<string>;
  }

  getSelectCardButton(): WebElement {
    return element(by.id('select-cards'));
  }

  getSelectCardCheckBoxes(): ElementArrayFinder {
    return element.all(by.className('select-item'));
  }

  getCompareButton(): WebElement {
    return element(by.id('compare-button'));
  }

  getElementByClass(className: string): WebElement {
    return element(by.className(className));
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
