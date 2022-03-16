# Welcome to the EcoShop Codebase!

**EcoShop is your innovative sustainability community, supporting the sale of preloved products and repair services using the latest Artificial Intelligence technologies, built on Huawei Cloud's amazing platform.**

Thank you for checking out our GitHub Repository! Our frontend is built in React, and our backend is written in Python and NodeJS, powered by Huawei Cloud.

Here is a brief summary of most of the Huawei Cloud Services we have used:

---

### **Huawei Cloud GaussDB for MySQL**

Contains most of our app data, as our app's use-case is well-suited to the relational database model. **Indices are created for high performance querying.**

### **Huawei Elastic Cloud Server**

Hosts our buyer-seller Websocket-based chat server, and an API that connects to **Huawei Cloud Optical Character Recognition (OCR)**.

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

### **Huawei Cloud ModelArts**

ModelArts hosts the CTRLsum Natural Langauge Processing API which powers many of our features, including **chatbot suggestions and product attribute autofill**.

### **Huawei Cloud Optical Character Recognition**

We use Huawei Cloud OCR to identify and extract commonly-used product attributes from user-submitted images. **This eliminates the need for users to copy information into product listings.**