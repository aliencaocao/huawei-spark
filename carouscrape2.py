import requests
from bs4 import BeautifulSoup
import json
import time
import re
import pprint

script_regex = re.compile(r"{\"@context\":(.+)</script>")

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
        category = ""
        prod_data = script_regex.search(str(item_soup)).group()
        prod_data = json.loads(prod_data.replace("</script>", ""))
        pprint.pprint(prod_data)
        attributes = item_soup.body.find('p', text='Posted').parent.parent.parent.parent.find_all("p", recursive=True)

        # PRODUCT CATEGORY
        print(item_soup.find("title").get_text().replace(prod_data["name"], ""))

        attr_name = ""
        attr_state = "waiting" # waiting = not at the Description yet; name = attribute name; value = attribute value
        prod_attr = {} # PRODUCT ATTRIBUTES MAP
        for attribute in attributes:
            # we're operating on the assumption that it's Description, <attr name>, <attr value>
            attr_text = attribute.get_text()

            if attr_state == "value":
                if len(attr_text) > 20:
                    print(prod_attr)
                    break

                prod_attr[attr_text] = ""
                attr_name = attr_text
                attr_state = "name"
            elif attr_state == "name":
                prod_attr[attr_name] = attr_text
                attr_state = "value"

            if attr_text == "Description":
                attr_state = "value"

            # print(attribute.get_text())
        
        print(prod_attr)
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
