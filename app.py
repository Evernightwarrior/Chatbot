import os
import requests
import PyPDF2
from flask import Flask, render_template, request, jsonify
from os import getenv

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads/'  
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


GROQCLOUD_API_KEY = getenv("GROQCLOUD_API_KEY")
GROQCLOUD_API_URL = getenv("GROQCLOUD_API_URL")


def generate_response(user_input):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GROQCLOUD_API_KEY}",
    }

    data = {
        "model": "llama3-8b-8192",  
        "messages": [{"role": "user", "content": user_input}],
    }

    response = requests.post(GROQCLOUD_API_URL, json=data, headers=headers)
    
    if response.status_code == 200:
        response_data = response.json()
        return response_data["choices"][0]["message"]["content"]
    else:
        return "Error: Unable to get a response from GroqCloud."

def extract_text_from_pdf(pdf_file):
    text = ""
    with open(pdf_file, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    print("Extracted text:", text)  
    return text.strip()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/get_response", methods=["POST"])
def get_response():
    user_input = request.form.get("user_input", "")
    file = request.files.get("file")

    
    if file and file.filename.endswith('.pdf'):
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)
        user_input += "\n" + extract_text_from_pdf(file_path)

    bot_response = generate_response(user_input)
    return jsonify({"response": bot_response})

if __name__ == "__main__":
    app.run(debug=True)