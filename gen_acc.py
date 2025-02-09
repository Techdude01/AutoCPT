import os
import re
from groq import Groq
from dotenv import load_dotenv
import requests

load_dotenv()

API_KEY = "02dc910989978df6be6517970f552768"
BASE_URL = "http://api.nessieisreal.com"


def gen_account(customer_id):
    url = f"{BASE_URL}/customers/{customer_id}/accounts?key={API_KEY}"
    account = {
        "type": "Credit Card",
        "nickname": "blue cross",
        "rewards": 100,
        "balance": 25500,
        }
    response = requests.post(url, json=account)
    if response.status_code == 201:
        print("Account successfully uploaded")
    else:
        print(response.text)
    return


customer_ids = [
    "67a850db9683f20dd518be94",
    "67a850db9683f20dd518be95",
    "67a850db9683f20dd518be96", 
    "67a850db9683f20dd518be97"
]

for id in customer_ids:
    gen_account(id)