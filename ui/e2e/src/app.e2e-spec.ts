import { AppPage } from './app.po';
import { browser, logging, Key } from 'protractor';

const pageSize = 8;

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

    browser.wait(page.isClickable(searchInput), 3000);
    browser.wait(page.isClickable(sortOption), 3000);
    browser.wait(page.isClickable(pageInput), 3000);
    browser.wait(page.isClickable(jumpToButton), 3000);

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
    it('should display Nutrition as app title', () => {
      expect(page.getTitleText()).toEqual('Nutrition');
    });
  
    it('should display Search input with empty initial value', () => {
      //page.navigateTo();
      expect(page.getSearchInput()).toEqual('');
    });
  
    it('should display Sort select input', () => {
      expect(page.getSortInput()).toEqual('select');
    });
  
    it(`should display ${pageSize} feed cards on page load`, async () => {
      const feedCards = await page.getFeedCardTitles();
      expect(feedCards.length).toEqual(pageSize);
    });

    it('should display page status as `Page: 1 Total: 61`', () => {
      const textToVerify = 'Page: 1 Total: 61';
      const pageStatus = page.getPageStatusElement();
      browser.wait(page.isTextVisible(pageStatus, textToVerify));
      expect(pageStatus.getText()).toBe(textToVerify);
    });
  });

  describe('feed cards', () => {
    it('first feed card must have title `Asparagus`', async () => {
      const feedCardTitles = await page.getFeedCardTitles();
      expect(feedCardTitles[0].getText()).toEqual(`Asparagus`);
    });
  
    it('last feed card on page 1 must have title `Green (Snap) Beans`', async () => {
      const feedCardTitles = await page.getFeedCardTitles();
      expect(feedCardTitles[feedCardTitles.length - 1].getText()).toEqual(`Green (Snap) Beans`);
    });
  });

  describe('Compare cards', () => {
    it(`select first card, should update page status text as 'Selected (1)'`, () =>{
      const selectCardsButton = page.getSelectCardButton();
      const textToVerify = 'Selected (1)';

      browser.wait(page.isClickable(selectCardsButton));
      selectCardsButton.click();

      const selectCheckBoxes = page.getSelectCardCheckBoxes();
      expect(selectCheckBoxes.count()).toBe(pageSize);
      selectCheckBoxes.get(0).click();

      const pageStatus = page.getPageStatusElement();
      browser.wait(page.isTextVisible(pageStatus, textToVerify));
      expect(pageStatus.getText()).toBe(textToVerify);
    })

    it('select and un-select a card, should display page status text as `Selected (0)`', () => {
      const selectCardsButton = page.getSelectCardButton();
      const textToVerify = 'Selected (0)';

      browser.wait(page.isClickable(selectCardsButton));
      selectCardsButton.click();

      const selectCheckBoxes = page.getSelectCardCheckBoxes();
      expect(selectCheckBoxes.count()).toBe(pageSize);
      selectCheckBoxes.get(0).click();
      selectCheckBoxes.get(0).click();

      const pageStatus = page.getPageStatusElement();
      browser.wait(page.isTextVisible(pageStatus, textToVerify));
      expect(pageStatus.getText()).toBe(textToVerify);
    });

    it('select two cards and compare, should display comparision cards having span with appropriate class names', async () => {
      const rankingClassAndLabels = [{ className: 'top-rank', label: 'Winner!'}, {className: 'rankings', label: '2'}]; 
      const selectCardsButton = page.getSelectCardButton();
      const compareButton = page.getCompareButton();

      browser.wait(page.isClickable(selectCardsButton));
      browser.wait(page.isClickable(compareButton));

      selectCardsButton.click();

      const selectCheckBoxes = page.getSelectCardCheckBoxes();
      expect(selectCheckBoxes.count()).toBe(pageSize);

      selectCheckBoxes.get(0).click();
      selectCheckBoxes.get(1).click();

      browser.sleep(200);
      compareButton.click();

      const topRankLabel = await page.getElementByClass(rankingClassAndLabels[0].className);
      const rankingLabel = await page.getElementByClass(rankingClassAndLabels[1].className);

      browser.wait(page.isTextVisible(topRankLabel, rankingClassAndLabels[0].label));
      browser.wait(page.isTextVisible(rankingLabel, rankingClassAndLabels[1].label));

      expect(topRankLabel.getText()).toBe(rankingClassAndLabels[0].label);
      expect(rankingLabel.getText()).toBe(rankingClassAndLabels[1].label);
    });
  });

  describe('search titles', () => {
    it('search term `green` should return 3 cards', async () => {
      const searchInput = page.getSearchWebElement();
      searchInput.sendKeys('green');
      searchInput.sendKeys(Key.ENTER);
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCardTitles();
      expect(feedCardTitles.length).toEqual(3);
    });

    it('search term `green` should match the given names (default filters)', async () => {
      //page.navigateTo();
      const namesToMatch = [
        'Green (Snap) Beans',
        'GreenÊCabbage',
        'Green Onion'
      ];
      const searchInput = page.getSearchWebElement();
      searchInput.clear();
      searchInput.sendKeys('green');
      searchInput.sendKeys(Key.ENTER);
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCardTitles();
      expect(feedCardTitles.length).toEqual(namesToMatch.length);
      feedCardTitles.forEach((cardTitle, index) => {
        const nameToMatch = namesToMatch[index].length > 32 ? namesToMatch[index].substr(0, 32) + '..' : namesToMatch[index];
        expect(cardTitle.getText()).toEqual(nameToMatch);
      });
    });

    it('search term `"Green Onion"` should return 1 cards with expected name', async () => {
      const expectedNames = [
        'Green Onion'
      ];
      const searchInput = page.getSearchWebElement();
      searchInput.clear();
      searchInput.sendKeys(`"Green Onion"`);
      searchInput.sendKeys(Key.ENTER);
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCardTitles();
      expect(feedCardTitles.length).toEqual(expectedNames.length);
      feedCardTitles.forEach((cardTitle, index) => {
        const nameToMatch = expectedNames[index].length > 32 ? expectedNames[index].substr(0, 32) + '..' : expectedNames[index];
        expect(cardTitle.getText()).toEqual(nameToMatch);
      });
    });

    it('search term `brocco` should return 1 card with expected name', async () => {
      const expectedNames = [
        'Broccoli'
      ];
      const searchInput = page.getSearchWebElement();
      searchInput.clear();
      searchInput.sendKeys(`brocco`);
      searchInput.sendKeys(Key.ENTER);
      await browser.sleep(1300);
      const feedCardTitles = await page.getFeedCardTitles();
      expect(feedCardTitles.length).toEqual(expectedNames.length);
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
      const feedCard = await page.getFeedCard();
      expect(feedCard.isPresent()).toBe(false);
    });

    it('should return 5 feed cards when we paginate to 8th page', async () => {
      const pageInput    = page.getPageInputWebElement();
      const jumpToButton = page.getJumpToPageButton();

      await browser.sleep(1000);
      pageInput.clear();
      pageInput.sendKeys(8);
      pageInput.sendKeys(Key.ENTER);
      jumpToButton.click();
      await browser.sleep(1300);
      const feedCardTitles = await page.getFeedCardTitles();
      expect(feedCardTitles.length).toEqual(5);
    });

    it('should return 0 feed cards when we paginate to 2nd page with search term `brocco`', async () => {
      const searchInput  = page.getSearchWebElement();
      const pageInput    = page.getPageInputWebElement();
      const jumpToButton = page.getJumpToPageButton();

      searchInput.sendKeys('brocco');
      searchInput.sendKeys(Key.ENTER);
      await browser.sleep(1000);
      pageInput.clear();
      pageInput.sendKeys(2);
      pageInput.sendKeys(Key.ENTER);
      jumpToButton.click();
      await browser.sleep(1500);
      const feedCardTitles = await page.getFeedCardTitles();
      expect(feedCardTitles.length).toEqual(0);
    });
  });

  describe('Sorting tests', () => {
    it('sorting by id in desc order on page 3 should return first title as `Flounder/Sole`', async () => {
      const sortOption   = await page.getSortWebElement('sort-2');
      const pageInput    = page.getPageInputWebElement();
      const jumpToButton = page.getJumpToPageButton();
      
      pageInput.clear();
      pageInput.sendKeys(3);
      pageInput.sendKeys(Key.ENTER);
      jumpToButton.click();
      await browser.sleep(1000);
      sortOption.click();
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCardTitles();
      expect(feedCardTitles[0].getText()).toEqual('Flounder/Sole');
    });

    it('sorting by id in asc order should return first title as `Asparagus`', async () => {
      const sortOption = await page.getSortWebElement('sort-1');
      sortOption.click();
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCardTitles();
      expect(feedCardTitles[0].getText()).toEqual('Asparagus');
    });

    it('sorting by name in asc order should return first name as `Apple`', async () => {
      const sortOption = await page.getSortWebElement('sort-3');
      sortOption.click();
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCardTitles();
      expect(feedCardTitles[0].getText()).toEqual('Apple');
    });

    it('sorting by name in desc order on page 3 should return first title as `Rainbow Trout`', async () => {
      const sortOption = await page.getSortWebElement('sort-4');
      const pageInput    = page.getPageInputWebElement();
      const jumpToButton = page.getJumpToPageButton();
      
      pageInput.clear();
      pageInput.sendKeys(3);
      pageInput.sendKeys(Key.ENTER);
      jumpToButton.click();
      await browser.sleep(1000);
      sortOption.click();
      await browser.sleep(1000);
      const feedCardTitles = await page.getFeedCardTitles();
      expect(feedCardTitles[0].getText()).toEqual('Rainbow Trout');
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
