# Welcome to the EcoShop Codebase!

**EcoShop is your innovative sustainability community, supporting the sale of preloved products and repair services using the latest Artificial Intelligence technologies, built on Huawei Cloud's amazing platform.**

Thank you for checking out our GitHub Repository! Our frontend is built in React, and our backend is written in Python and NodeJS, powered by Huawei Cloud.

## Team Members
- [Theodore Lee](https://github.com/TheoLeeCJ)
- [Cao Yuxuan](https://github.com/aliencaocao)
- [Ho Wing Yip](https://github.com/HoWingYip)
- [Teo Kai Xiang](https://github.com/Tkaixiang)


## Key Features

1. **Bulk Listing** - we allow users to upload one image containing multiple items, and automatically extract the items using **Huawei Cloud Image Tagging** to prepare multiple listings for users. This saves users' time and effort!

2. **Natural Language Processing Chatbot Suggestions** - powered by CTRLsum on **Huawei Cloud ModelArts**, our chat system scans seller-provided descriptions and buyer-sent questions to suggest the most suitable replies to the seller, reducing buyer waiting and effort required from sellers!

3. **Video Platform** - short-format videos have proven to be extremely effective in engaging users. Therefore, we incorporated a short-video oriented social media platform into EcoShop, allowing sellers to market their products better - especially for repair services! Powered by **Huawei Cloud Media Processing Centre** and **Huawei Cloud Object Storage Service**.

Our platform also incorporates other **Huawei Cloud** services to improve the user experience, allowing for **automatic information extraction, fast, responsive APIs, and more!**

## Cloud Services

Here is a brief summary of most of the Huawei Cloud Services we have used:

---

### **Huawei Cloud GaussDB for MySQL**

Contains most of our app data, as our app's use-case is well-suited to the relational database model. **Indices are created for high performance querying.**

### **Huawei Elastic Cloud Server**

Hosts our buyer-seller Websocket-based chat server, and an API that connects to **Huawei Cloud Optical Character Recognition (OCR)**.

### **Huawei Cloud ModelArts**

ModelArts hosts the CTRLsum Natural Langauge Processing API which powers many of our features, including **chatbot suggestions and product attribute autofill**.

### **Huawei Cloud Optical Character Recognition**

We use Huawei Cloud OCR to identify and extract commonly-used product attributes from user-submitted images. **This eliminates the need for users to copy information into product listings.**

### **Huawei Cloud Object Storage Service**

User-generated content such as videos and images is stored in OBS. Our static website is also hosted on OBS.

Furthermore, we use **OBS' Image Processing Styles to save users' bandwidth and give users a better experience.**

### **Huawei Cloud Media Processing Centre**

In order to support our engaging video platform, we used Huawei Cloud MPC to **transcode user-uploaded videos to streaming formats (DASH + HLS)** in a standardised resolution.

### **Huawei Cloud Virtual Private Cloud**

Huawei Cloud VPC is used to create a **secure private network for our cloud resources** (FunctionGraph functions, GaussDB for MySQL database, internal APIs) to communicate.

### **Huawei Cloud Virtual Private Network**

We used Huawei Cloud VPN and VPN Gateways to connect our VPC in Guangzhou to our VPC in Hong Kong, for some services such as GaussDB for MySQL.

### **Huawei Cloud FunctionGraph**

Powers most of our app's API. We chose FunctionGraph as its serverless nature allows us to **scale our services up and down according to user demand**.

### **Huawei Cloud API Gateway**

We use API Gateway to connect our FunctionGraph APIs to endpoints which can be accessed using standard HTTP.

### **Huawei Cloud Image Tagging**

Image Tagging is used to extract multiple items from one user-submitted image, powering our **bulk listing feature**.

### **Huawei Cloud Moderation**

Huawei Cloud Moderation keeps our platform safe from inappropriate content.
