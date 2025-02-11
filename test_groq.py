import os
import re
from groq import Groq
from dotenv import load_dotenv
import requests
import json
from datetime import datetime
load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
API_KEY = "02dc910989978df6be6517970f552768"
BASE_URL = "http://api.nessieisreal.com"

global matches

def get_cpt_codes(medical_text):

    # medical_text = """Mrs. Thompson visited her primary care physician for her yearly wellness checkup. 
    # During the appointment, she received a flu vaccination. The doctor identified a suspicious mole on her back 
    # and performed a biopsy for further analysis. Bloodwork was ordered, including a lipid profile and a complete 
    # blood count (CBC). Due to persistent knee pain, an X-ray of the left knee was conducted. Finally, a 15-minute 
    # telehealth follow-up was scheduled to review results."""

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": f"""List CPT codes for each procedure in the text, formatted as 'CODE: DESCRIPTION' (one per line). Make sure to include the specific codes, and try to keep the description as short as possible. Also try to include as little overlap in the codes you provide (Don't give 99923 and 99924 if you can give just 99923). Example format:
    99396: Annual wellness checkup
    
    Input medical text:
    {medical_text}"""  # Removed the trailing "."
            }
        ],
        model="llama-3.3-70b-versatile",
    )

    response = chat_completion.choices[0].message.content


    # Extract codes using colon separator
    matches = re.findall(r'(\d{5})\s*:\s*(.*?)(?=\s*\d{5}|$)', response, flags=re.DOTALL)

    return {code: description.strip() for code, description in matches}
def get_account_id(customer_id):
    url = f"{BASE_URL}/customers/{customer_id}/accounts?key={API_KEY}"
    response = requests.get(url)
    for account in response.json():
        if account["nickname"] == "blue cross":
            return account["_id"]
    return None

def get_patient_id(first_name, last_name):
    url = f"{BASE_URL}/customers?key={API_KEY}"
    response = requests.get(url)
    for customer in response.json():
        if customer["first_name"] == first_name and customer["last_name"] == last_name:
            return customer["_id"]
    return None

def gen_bill(account_id, cpt_codes):
    url = f"{BASE_URL}/accounts/{account_id}/bills?key={API_KEY}"
    print(cpt_codes)
    print(account_id)
    for cpt_code, cost in cpt_codes.items(): 
        bill_data = {
        "status": "pending",
        "payee": "Medical Center",
        "nickname": cpt_code,
        "payment_date": datetime.now().strftime("%Y-%m-%d"),
        "payment_amount": cost,
        "recurring_date": 1
        }
        response = requests.post(url, json=bill_data)
        if response.status_code == 201:
            print("Bill successfully uploaded")
        else:
            print(response.text)

def get_moneyz(cpt_codes, visit_context):
    print(cpt_codes)
    
    response = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content":  f"Based on Medicare fee schedules, please provide cost estimates for the following CPT codes. Return only a JSON object where keys are CPT codes and values are numeric costs in USD. Make it extremely accurate estimate, to the cent. CPT codes: {', '.join(cpt_codes.keys())}"
            },
            {
                "role": "user", 
                "content": "Visit Context: " + visit_context
            }
        ],
        model="deepseek-r1-distill-llama-70b",
        reasoning_format="hidden",
        response_format={"type": "json_object"},
        temperature=0.6
    )
    json_response = json.loads(response.choices[0].message.content)
    print(json_response)
    return json_response
