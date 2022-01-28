import requests
from bs4 import BeautifulSoup
import json
import time


def request_page(url):
    r = requests.get(url)
    return BeautifulSoup(r.text, "html.parser")


items = {}
failed_items = 0
prefix = 'https://www.carousell.sg/p/'
start_id = 1137583000
items_to_scrap = 8000
time_taken = 0
for id in range(start_id, start_id - items_to_scrap, -1):
    start = time.time()
    url = prefix + str(id)
    item_soup = request_page(url)
    try:
        item_soup = item_soup.body.find('div').find('div').find_all('div', recursive=False)[2]
        top_section = item_soup.find('section').find('div').find('div').find('div')
        title = item_soup.find_all('div', recursive=False)[1].find('div').find('div').find('div').find('p').get_text().strip()
        likes = top_section.find_all('div', recursive=False)[1].find_all('button', recursive=False)[-1].find('p').get_text().split()[0]  # remove trailing 'likes'
        img = top_section.find_all('div', recursive=False)[-1].find('div').find('img')['src']
        item_details_soup = \
        item_soup.find_all('div', recursive=False)[1].find('div').find('div').find_all('div', recursive=False)[1].find('section').find_all('div', recursive=False)[3]
        # item_details_soup = [soup for soup in item_details_soup if soup.get_text() == 'Description'][0]  # position of div may change so filter based on text
        item_details_divs = item_details_soup.find_all('div', recursive=False)
        attribute_divs = item_details_divs[0].find('div').find_all('div', recursive=False)
        attributes = {div.find_all('p', recursive=False)[0].get_text(): div.find_all('p', recursive=False)[1].get_text() for div in attribute_divs}
        attributes.pop('Posted')  # remove time posted, also act as a check, if got error, then scraping algo likely failed
        description = item_details_divs[1].get_text().replace('\n', ' ').replace('\t', ' ').replace('\r', ' ').strip()
        items.update({id: {'title': title, 'url': url, 'img': img, 'attributes': attributes, 'desc': description, 'likes': likes}})
    except Exception as e:  # means product already delisted, attribute error confirm is, rest is other reasons
        failed_items += 1
        print(url, e)
    end = time.time()
    time_taken += end - start

print(f'Scraping completed. Successfully scraped {len(items)}, failed {failed_items}, total time taken: {time_taken}, average time taken: {round(time_taken / len(items_to_scrap), 5)}')

with open('data.json', 'w') as f:
    json.dump(items, f)

'''
Scraping history: 
scrapped range: 1137582001-1137583000, Successfully scraped 143, failed 857, total time taken: 1247.0696976184845, average time taken: 8.72077
'''
