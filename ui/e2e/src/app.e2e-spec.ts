import { AppPage } from './app.po';
import { browser, logging, Key, protractor } from 'protractor';

describe('Feed App', () => {
  let page: AppPage;

  beforeEach(async () => {
    page = new AppPage();
    page.navigateTo();

    browser.executeScript('localStorage.clear();');
    const searchInput  = page.getSearchWebElement();
    const sortOption   = page.getSortWebElement('sort-1');
    const pageInput    = page.getPageInputWebElement();
    const jumpToButton = page.getJumpToPageButton();

    searchInput.clear();
    await browser.sleep(100);
    sortOption.click();
    await browser.sleep(100);
    pageInput.clear();
    pageInput.sendKeys(1);
    pageInput.sendKeys(Key.ENTER);
    jumpToButton.click();
    await browser.sleep(300);
  });

  describe('UI elements', () => {
    it('should display Feed as app title', () => {
      expect(page.getTitleText()).toEqual('Feed');
    });
  
    it('should display Search input with empty initial value', () => {
      //page.navigateTo();
      expect(page.getSearchInput()).toEqual('');
    });
  
    it('should display Sort select input', () => {
      expect(page.getSortInput()).toEqual('select');
    });
  
    it('should display 6 feed cards on page load', async () => {
      const feedCards = await page.getFeedCards();
      expect(feedCards.length).toEqual(6);
    });
  });

  describe('feed cards', () => {
    it('first feed card must have title `Chief Brand Orchestrator`', async () => {
      const feedCardTitles = await page.getFeedCards();
      expect(feedCardTitles[0].getText()).toEqual(`Chief Brand Orchestrator`);
    });
  
    it('last feed card must have title `Investor Quality Executive`', async () => {
      const feedCardTitles = await page.getFeedCards();
      expect(feedCardTitles[feedCardTitles.length - 1].getText()).toEqual(`Investor Quality Executive`);
    });
  });

  describe('search titles', () => {
    it('search term `king` should return 4 cards', async () => {
      const searchInput = page.getSearchWebElement();
      searchInput.sendKeys('king');
      searchInput.sendKeys(Key.ENTER);
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCards();
      expect(feedCardTitles.length).toEqual(4);
    });

    it('search term `king` should match the given titles (default filters)', async () => {
      //page.navigateTo();
      const titlesToMatch = [
        'The Lion King',
        'Human Web Agent',
        'The Lord of the Rings: The Return of the King',
        'District Solutions Orchestrator'
      ];
      const searchInput = page.getSearchWebElement();
      searchInput.clear();
      searchInput.sendKeys('king');
      searchInput.sendKeys(Key.ENTER);
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCards();
      expect(feedCardTitles.length).toEqual(4);
      feedCardTitles.forEach((cardTitle, index) => {
        const titleToMatch = titlesToMatch[index].length > 32 ? titlesToMatch[index].substr(0, 32) + '..' : titlesToMatch[index];
        expect(cardTitle.getText()).toEqual(titleToMatch);
      });
    });

    it('search term `"the lion king"` should return 2 cards with expected titles', async () => {
      const expectedTitles = [
        'The Lion King',
        'District Solutions Orchestrator'
      ];
      const searchInput = page.getSearchWebElement();
      searchInput.clear();
      searchInput.sendKeys(`"the lion king"`);
      searchInput.sendKeys(Key.ENTER);
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCards();
      expect(feedCardTitles.length).toEqual(2);
      feedCardTitles.forEach((cardTitle, index) => {
        const titleToMatch = expectedTitles[index].length > 32 ? expectedTitles[index].substr(0, 32) + '..' : expectedTitles[index];
        expect(cardTitle.getText()).toEqual(titleToMatch);
      });
    });
  });

  describe('Pagination tests', () => {
    it('should return 0 feed cards when we paginate to 100th page as no data exists', async () => {
      const pageInput    = page.getPageInputWebElement();
      const jumpToButton = page.getJumpToPageButton();

      await browser.sleep(1000);
      pageInput.clear();
      pageInput.sendKeys(100);
      pageInput.sendKeys(Key.ENTER);
      jumpToButton.click();
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCards();
      expect(feedCardTitles.length).toEqual(0);
    });

    it('should return 4 feed cards when we paginate to 17th page', async () => {
      const pageInput    = page.getPageInputWebElement();
      const jumpToButton = page.getJumpToPageButton();
      const searchInput  = page.getSearchWebElement();

      await browser.sleep(1000);
      pageInput.clear();
      pageInput.sendKeys(17);
      pageInput.sendKeys(Key.ENTER);
      jumpToButton.click();
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCards();
      expect(feedCardTitles.length).toEqual(4);
    });

    it('should return 0 feed cards when we paginate to 2nd page with search term `king`', async () => {
      const searchInput  = page.getSearchWebElement();
      const pageInput    = page.getPageInputWebElement();
      const jumpToButton = page.getJumpToPageButton();

      searchInput.sendKeys('king');
      searchInput.sendKeys(Key.ENTER);
      await browser.sleep(1000);
      pageInput.clear();
      pageInput.sendKeys(2);
      pageInput.sendKeys(Key.ENTER);
      jumpToButton.click();
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCards();
      expect(feedCardTitles.length).toEqual(0);
    });
  });

  describe('Sorting tests', () => {
    it('sorting by dateLastEdited in desc order should return first title as `Regional Marketing Developer`', async () => {
      const sortOption = await page.getSortWebElement('sort-2');
      sortOption.click();
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCards();
      expect(feedCardTitles[0].getText()).toEqual('Regional Marketing Developer');
    });

    it('sorting by dateLastEdited in asc order should return first title as `Chief Brand Orchestrator`', async () => {
      const sortOption = await page.getSortWebElement('sort-1');
      sortOption.click();
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCards();
      expect(feedCardTitles[0].getText()).toEqual('Chief Brand Orchestrator');
    });

    it('sorting by title in asc order should return first title as `Central Creative Producer`', async () => {
      const sortOption = await page.getSortWebElement('sort-3');
      sortOption.click();
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCards();
      expect(feedCardTitles[0].getText()).toEqual('Central Creative Producer');
    });

    it('sorting by title in desc order should return first title as `The Lord of the Rings: The Retur..`', async () => {
      const sortOption = await page.getSortWebElement('sort-4');
      sortOption.click();
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCards();
      expect(feedCardTitles[0].getText()).toEqual('The Lord of the Rings: The Retur..');
    });
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
