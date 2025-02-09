import os
import re
from groq import Groq
from dotenv import load_dotenv
import requests

load_dotenv()

API_KEY = "02dc910989978df6be6517970f552768"
BASE_URL = "http://api.nessieisreal.com"
url = f"{BASE_URL}/customers?key={API_KEY}"
customer_ids = {}

customers = [
    {
        "first_name": "John",
        "last_name": "Doe",
        "address": {
            "street_number": "123",
            "street_name": "Main St",
            "city": "New York",
            "state": "NY",
            "zip": "10001"
        }
    },
    {
        "first_name": "Jane",
        "last_name": "Smith",
        "address": {
            "street_number": "456",
            "street_name": "Elm St",
            "city": "Los Angeles",
            "state": "CA",
            "zip": "90001"
        }
    },
    {
        "first_name": "Alice",
        "last_name": "Brown",
        "address": {
            "street_number": "789",
            "street_name": "Pine St",
            "city": "Chicago",
            "state": "IL",
            "zip": "60601"
        }
    },
    {
        "first_name": "Bob",
        "last_name": "Johnson",
        "address": {
            "street_number": "321",
            "street_name": "Oak St",
            "city": "Houston",
            "state": "TX",
            "zip": "77001"
        }
    }
]

for customer in customers:
    response = requests.put(url, json=customer)
    input("ARE YOU SURE? ITS ALR BEEN RUN")
    if response.status_code == 201:
        customer_ids[customer["first_name"]] = response.json().get("objectCreated", {}).get("_id")
    else:
        print(response.text)
