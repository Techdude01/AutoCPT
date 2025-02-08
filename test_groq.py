import os
import re
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

medical_text = """Mrs. Thompson visited her primary care physician for her yearly wellness checkup. 
During the appointment, she received a flu vaccination. The doctor identified a suspicious mole on her back 
and performed a biopsy for further analysis. Bloodwork was ordered, including a lipid profile and a complete 
blood count (CBC). Due to persistent knee pain, an X-ray of the left knee was conducted. Finally, a 15-minute 
telehealth follow-up was scheduled to review results."""

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": f"""List CPT codes for each procedure in the text, formatted as 'CODE: DESCRIPTION' (one per line). Example:
99396: Annual wellness checkup
90471: Flu vaccine administration
{medical_text}"""  # Removed the trailing "."
        }
    ],
    model="llama-3.3-70b-versatile",
)

response = chat_completion.choices[0].message.content

# Extract codes using colon separator
matches = re.findall(r'(\d{5})\s*:\s*(.*?)(?=\s*\d{5}|$)', response, flags=re.DOTALL)

print("CPT Code Mapping:")
for code, description in matches:
    print(f"CPT {code}: {description.strip()}")