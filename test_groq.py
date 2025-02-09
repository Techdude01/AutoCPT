import os
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

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
