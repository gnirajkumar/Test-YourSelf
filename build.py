import os
import json
import openpyxl

QUIZDATA_DIR = "QuizData"
OUTPUT_FILE = "site/questions.json"

def excel_to_questions(path):
    wb = openpyxl.load_workbook(path)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    headers = rows[0]
    questions = []
    for row in rows[1:]:
        if not row[0]:
            continue
        data = dict(zip(headers, row))
        q = {
            "questionText": data["questionText"],
            "questionImage": data["questionImage"],
            "options": [
                {"text": data["option1"], "image": data["option1Image"]},
                {"text": data["option2"], "image": data["option2Image"]},
                {"text": data["option3"], "image": data["option3Image"]},
                {"text": data["option4"], "image": data["option4Image"]},
            ],
            "correct": int(data["correct"]) - 1,
            "explanationText": data["explanationText"],
            "explanationImage": data["explanationImage"],
        }
        questions.append(q)
    return questions

def build():
    all_data = {}
    for cls in os.listdir(QUIZDATA_DIR):
        class_path = os.path.join(QUIZDATA_DIR, cls)
        if not os.path.isdir(class_path): continue
        all_data[cls] = {}
        for subj in os.listdir(class_path):
            subj_path = os.path.join(class_path, subj)
            if not os.path.isdir(subj_path): continue
            all_data[cls][subj] = {}
            for file in os.listdir(subj_path):
                if file.endswith(".xlsx"):
                    topic = os.path.splitext(file)[0]
                    path = os.path.join(subj_path, file)
                    all_data[cls][subj][topic] = excel_to_questions(path)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)
    print(f"✅ Questions JSON written to {OUTPUT_FILE}")

if __name__ == "__main__":
    build()
