import axios from 'axios';
import cheerio from 'cheerio';
import { promises as fs } from 'fs'; // For working with the filesystem

// Regular expression pattern for matching phone numbers
const phoneRegex: RegExp = /(\+\d{1,4}[\s-]?)?(\(\d{1,4}\)[\s-]?)?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,4}/g;

// Function to scrape and collect phone numbers from a single page
async function scrapePage(pageNumber: number): Promise<string[]> {
  const url: string = `https://zvonili.com/?page=${pageNumber}`;
  console.log(`Scraping page ${url}`);

  try {
    const response = await axios.get(url);
    if (response.status !== 200) {
      console.error(`Failed to fetch page ${url}`);
      return [];
    }

    const $ = cheerio.load(response.data);
    const pageText: string = $('body').text();
    const matches: string[] | null = pageText.match(phoneRegex);

    if (matches) {
      const cleanedNumbers: string[] = matches.map((match) => match.replace(/[^\d]/g, ''));
      // Filter and format numbers based on the new conditions
      return cleanedNumbers.filter((number) => {
        // If the string contains exactly 10 digits and starts with 7, add '+'
        if (/^7\d{9}$/.test(number)) {
          return `+${number}`;
        }
        // If the string contains exactly 10 digits and the first three digits are not 800, add '+7'
        if (/^\d{10}$/.test(number) && !/^800/.test(number)) {
          return `+7${number}`;
        }
        return false; // Ignore other cases
      });
    }

    return [];
  } catch (error) {
    console.error(`Error while scraping page ${url}: ${(error as Error).message}`);
    return [];
  }
}

// Function to scrape all pages and collect phone numbers
async function scrapeAllPages(startPage: number, endPage: number): Promise<string[]> {
  const allPhoneNumbers: string[] = [];

  for (let page = startPage; page <= endPage; page++) {
    const phoneNumbers = await scrapePage(page);
    allPhoneNumbers.push(...phoneNumbers);
  }

  return allPhoneNumbers;
}

// Define the range of pages you want to scrape
const startPage: number = 1;
const endPage: number = 1; // You can adjust this based on the actual number of pages

// Call the function to start scraping
scrapeAllPages(startPage, endPage)
  .then((phoneNumbers) => {
    if (phoneNumbers.length > 0) {
      console.log(`Found ${phoneNumbers.length} phone numbers:`);
      console.log(phoneNumbers);

      // Save the results to a file
      const formattedNumbers = phoneNumbers.map((number) => number.replace(/^8/, '+7'));
      const outputText: string = formattedNumbers.join('\n');
      return fs.writeFile('blacklist.txt', outputText);
    } else {
      console.log('No phone numbers found on the site.');
    }
  })
  .then(() => {
    console.log('Results saved to "blacklist.txt".');
  })
  .catch((error) => {
    console.error(`Error while scraping: ${(error as Error).message}`);
  });
