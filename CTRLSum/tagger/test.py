import time
import requests

url = "https://01516f373f434921a874bf502a986a58.apig.ap-southeast-3.huaweicloudapis.com/v1/infers/3a471035-f481-4f5e-bb16-ecf9a4d4dded"
# url = "http://192.168.1.9:8080"
# url = "http://de.irscybersec.ml:8080"
headers = {'Content-Type': 'application/json', 'X-Apig-Appcode': 'b50c2b3280ce4962a72610a4a4e0fc14f3b6b05932de4346b21e41ec5c32c4ac'}

source = "Washington (CNN)An Iranian military observation aircraft flew within 50 yards of an armed U.S. Navy helicopter over the Persian Gulf this month, sparking concern that top Iranian commanders might not be in full control of local forces, CNN has learned. The incident, which has not been publicly disclosed, troubled U.S. military officials because the unsafe maneuver could have triggered a serious incident. It also surprised U.S. commanders because in recent months Iranian forces have conducted exercises and operations in the region in a professional manner, one U.S. military official told CNN. \"We think this might have been locally ordered,\" the official said. The incident took place as the U.S. and other world powers meet with Iran in Switzerland to negotiate a deal limiting Tehran’s nuclear program. At the same time, Iran has been active in supporting proxies in several hotspots in the Persian Gulf and neighboring regions. The Navy MH-60R armed helicopter was flying from the deck of the USS Carl Vinson on a routine patrol in international airspace, the official said. An unarmed Iranian observation Y-12 aircraft approached. The Iranian aircraft made two passes at the helicopter, coming within 50 yards, before the helicopter moved off, according to the official. The official said the helicopter deliberately broke off and flew away in a ’predictable’ manner so the Iranians could not misinterpret any U.S. intentions. The Navy helicopter was in radio contact with the ship during the encounter, but there was no contact between the two aircraft and no shots were fired. The Navy crew took photos of the incident but the military is not releasing them. The U.S. administration is considering a potential demarche protest against Iran, the official said. CNN has reached out to Iranian officials but has not received a response. This type of Iranian observation aircraft generally operates over the Gulf several times a month. But after the recent incident, U.S. naval intelligence did not see it again for two weeks, leading to the conclusion that the incident may have been ordered by a local commander who was then reprimanded by higher-ups. The Pentagon has noted for the last several years that most encounters with the Iranian military at sea or in air are conducted professionally, but that some missions run by Iranian Revolutionary Guard Corps forces have been too aggressive against U.S. forces in the area."
# source = "Hello World"
payload = {'source': source}

start = time.time()
# r = requests.get(f'{url}/health', headers=headers)
r = requests.post(f'{url}/tagger', headers=headers, json=payload)

print(r.text)
print(f'Time taken: {time.time() - start}')
