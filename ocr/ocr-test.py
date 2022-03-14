# coding=utf-8
import time
import requests

url = "https://182.160.1.242:8080"
# url = "http://192.168.1.9:8080"
image_url = 'https://www.minitool.com/images/uploads/news/2019/07/how-to-check-pc-specs-windows-10/how-to-check-pc-specs-windows-10-2.png'
category = 'Computer'
payload = {'category': category, 'image_url': image_url}

start = time.time()
r = requests.post(f'{url}/extract', json=payload)

print(r.text)
print(f'Time taken: {time.time() - start}')

category = 'Computer'
word_list = ['Settings', 'Home', 'About', 'Find a setting', 'System', 'Device specifications', 'Puvel & sleep', 'Device name', 'DESKTOP-V6183lG', 'Storage', 'Processor',
             'AMD Ryzen 5 2400G with Radeon Vega Graphics', '3.59 GHz', 'Tablet mode', 'Installed RAM', '2.00 GB', 'Device ID', 'A3C65BE3-F518-481F-9D67-72D929E34B21',
             'i：Multitasking', 'Product ID', '00331-10000-00001-AA877', 'System type', '32-bit operating system, x64-based processor', '口 Projecting to this PC',
             'Pen and touch', 'No pen or touch input is available for this display', 'X Shared experiences', 'Rename this PC', 'Remote Desktop', 'About',
             'Windows specifications', 'Edition', 'Windows 10 Pro', 'Version', '1803', 'Installed on', '4/8/2019']

category = 'Mobile Gadgets'
word_list = ['Xiaomi 12', '6+128', 'Blue']
word_list = ['Xiaomi 12', '6GB RAM', '128GB ROM', 'Blue']
word_list = ['5G数字移动电话机', '型号：TET-AN00', 'IMEI1:864725048031204', 'HUAWEI Mate X2', '颜色：冰晶蓝', '机身内存：8GB RAM+256GB ROM', 'CMIIT ID：2020CP10858', 'MEID:A00000BCD4F4E2', '执行标准：Q/DKBA 2529-2019', '进网许可证号：00-D710-208871', '华为终端有限公司', '中国制造 全网通版（不含充电器和数据线）', '广东省东莞市松山湖园区新城路2号', '1ME!2-864725049067612', '华为高城:wwwwritaticorn', '消费者尊享服务专线：950801', 'S/N:UDU0221421003820', '网址：http://consumer.huawei.com/cn .', '进网许可标志查验网址：jwxkjwql.miit.gov.cn', '仅限中国大陆境内销售与维保', 'Only for sale and warranty in Mainland China', '.941487"225064', '支持中国移动、中国联通、中国电信5G网络', '2021.04']
