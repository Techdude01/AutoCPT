import os
import re
from groq import Groq
from dotenv import load_dotenv
from ultralytics import YOLO
import cv2

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
                "content": f"""Task is to list CPT codes for each procedure in the text, formatted as 'CODE: DESCRIPTION' (one per line). Example:
    99396: Annual wellness checkup
    90471: Flu vaccine administration
    
    {medical_text};make sure you only list the codes and not any other output"""  # Removed the trailing "."
            }
        ],
        model="llama-3.3-70b-versatile",
    )

    response = chat_completion.choices[0].message.content

    # Extract codes using colon separator
    matches = re.findall(r'(\d{5})\s*:\s*(.*?)(?=\s*\d{5}|$)', response, flags=re.DOTALL)

    return {code: description.strip() for code, description in matches}
    # for code, description in matches:
    #     print(f"CPT {code}: {description.strip()}")

def testDetect():
    names=["best.pt","bestOld.pt"]
    for mName in names:
        model = YOLO(mName)  # Replace with your model file path if needed

        # Load the image to test
        image_path = 'istockphoto-471457370-612x612.jpg'
        img = cv2.imread(image_path)
        # Perform inference (object detection)
        results = model(img)
        # Draw the results on the image (bounding boxes, labels)
        img_with_detections = results[0].plot()
        # Save or display the result
        output_image_path = mName+'.jpg'
        cv2.imwrite(output_image_path, img_with_detections)  # Save the image with detections

        print(f"Detection result saved at: {output_image_path}")

def main():
    testDetect()
main()