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
    it('should display Superheroes as app title', () => {
      expect(page.getTitleText()).toEqual('Superheroes');
    });
  
    it('should display Search input with empty initial value', () => {
      //page.navigateTo();
      expect(page.getSearchInput()).toEqual('');
    });
  
    it('should display Sort select input', () => {
      expect(page.getSortInput()).toEqual('select');
    });
  
    it('should display 10 feed cards on page load', async () => {
      const feedCards = await page.getFeedCards();
      expect(feedCards.length).toEqual(10);
    });
  });

  describe('feed cards', () => {
    it('first feed card must have title `Air-Walker`', async () => {
      const feedCardTitles = await page.getFeedCards();
      expect(feedCardTitles[0].getText()).toEqual(`Air-Walker`);
    });
  
    it('last feed card must have title `Yellowjacket II`', async () => {
      const feedCardTitles = await page.getFeedCards();
      expect(feedCardTitles[feedCardTitles.length - 1].getText()).toEqual(`Yellowjacket II`);
    });
  });

  describe('search titles', () => {
    it('search term `batman` should return 3 cards', async () => {
      const searchInput = page.getSearchWebElement();
      searchInput.sendKeys('batman');
      searchInput.sendKeys(Key.ENTER);
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCards();
      expect(feedCardTitles.length).toEqual(3);
    });

    it('search term `super` should match the given names (default filters)', async () => {
      //page.navigateTo();
      const namesToMatch = [
        'Cyborg Superman',
        'Superboy',
        'Supergirl',
        'Superboy-Prime'
      ];
      const searchInput = page.getSearchWebElement();
      searchInput.clear();
      searchInput.sendKeys('super');
      searchInput.sendKeys(Key.ENTER);
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCards();
      expect(feedCardTitles.length).toEqual(5);
      feedCardTitles.forEach((cardTitle, index) => {
        const nameToMatch = namesToMatch[index].length > 32 ? namesToMatch[index].substr(0, 32) + '..' : namesToMatch[index];
        expect(cardTitle.getText()).toEqual(nameToMatch);
      });
    });

    it('search term `"Agent 13"` should return 1 cards with expected name', async () => {
      const expectedNames = [
        'Agent 13'
      ];
      const searchInput = page.getSearchWebElement();
      searchInput.clear();
      searchInput.sendKeys(`"Agent 13"`);
      searchInput.sendKeys(Key.ENTER);
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCards();
      expect(feedCardTitles.length).toEqual(1);
      feedCardTitles.forEach((cardTitle, index) => {
        const nameToMatch = expectedNames[index].length > 32 ? expectedNames[index].substr(0, 32) + '..' : expectedNames[index];
        expect(cardTitle.getText()).toEqual(nameToMatch);
      });
    });

    it('search term `abomina` should return 1 card with expected name', async () => {
      const expectedNames = [
        'Abomination'
      ];
      const searchInput = page.getSearchWebElement();
      searchInput.clear();
      searchInput.sendKeys(`region`);
      searchInput.sendKeys(Key.ENTER);
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCards();
      expect(feedCardTitles.length).toEqual(1);
      feedCardTitles.forEach((cardTitle, index) => {
        const nameToMatch = expectedNames[index].length > 32 ? expectedNames[index].substr(0, 32) + '..' : expectedNames[index];
        expect(cardTitle.getText()).toEqual(nameToMatch);
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

    it('should return 1 feed cards when we paginate to 74th page', async () => {
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
      expect(feedCardTitles.length).toEqual(1);
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
    it('sorting by id in desc order should return first title as `Yellowjacket II`', async () => {
      const sortOption = await page.getSortWebElement('sort-4');
      sortOption.click();
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCards();
      expect(feedCardTitles[0].getText()).toEqual('Yellowjacket II');
    });

    it('sorting by id in asc order should return first title as `Abe Sapien`', async () => {
      const sortOption = await page.getSortWebElement('sort-3');
      sortOption.click();
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCards();
      expect(feedCardTitles[0].getText()).toEqual('Abe Sapien');
    });

    it('sorting by name in asc order should return first name as `A-Bomb`', async () => {
      const sortOption = await page.getSortWebElement('sort-1');
      sortOption.click();
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCards();
      expect(feedCardTitles[0].getText()).toEqual('A-Bomb');
    });

    it('sorting by name in desc order should return first title as `Zoom`', async () => {
      const sortOption = await page.getSortWebElement('sort-2');
      sortOption.click();
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCards();
      expect(feedCardTitles[0].getText()).toEqual('Zoom');
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
