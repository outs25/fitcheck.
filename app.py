# app.py
from flask import Flask, request, jsonify
from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import torch
import io

app = Flask(__name__)

# Load model once (at start)
processor = AutoImageProcessor.from_pretrained("wargoninnovation/wargon-clothing-classifier")
model = AutoModelForImageClassification.from_pretrained("wargoninnovation/wargon-clothing-classifier")

@app.route('/predict', methods=['POST'])
def predict():
    # Get the uploaded image
    file = request.files['file']
    image = Image.open(io.BytesIO(file.read())).convert("RGB")

    # Prepare image and run prediction
    inputs = processor(image, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
        predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
        predicted_class_id = predictions.argmax().item()
        predicted_label = model.config.id2label[predicted_class_id]
        confidence = predictions[0][predicted_class_id].item()

    # Send result back as JSON
    return jsonify({
        "label": predicted_label,
        "confidence": round(float(confidence), 3)
    })

if __name__ == '__main__':
    app.run(debug=True)
    