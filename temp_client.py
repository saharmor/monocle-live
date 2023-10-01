# ping my backend server on http://127.0.0.1:5000 with a wav file using the requests library
import requests


sample_file = open("test_de.wav", "rb")
upload_file = {"file": sample_file}
response = requests.post('http://127.0.0.1:5000/receive-img', files = upload_file)

#print response.text
print(response.text)