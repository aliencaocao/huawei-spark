from pororo import Pororo
caption = Pororo(task='caption', lang='en')  # will download model first time
print(caption('path to img'))