import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "db.json");

// Инициализация БД если нет файла
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ reviews: [] }, null, 2));
}

const app = express();

app.use(cors());
app.use(express.json());

// API Отзывов
app.get("/api/reviews", (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
        res.json(data.reviews || []);
    } catch (error) {
        res.status(500).json({ error: "Ошибка чтения базы данных" });
    }
});

app.post("/api/reviews", (req, res) => {
    try {
        const newReview = req.body;
        const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
        if (!data.reviews) data.reviews = [];
        data.reviews.push(newReview);
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
        res.json({ success: true, review: newReview });
    } catch (error) {
        res.status(500).json({ error: "Ошибка сохранения отзыва" });
    }
});

app.post("/generate", async (req, res) => {

    const userData = req.body;

    try {
        const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer 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"
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "system",
                            content: "Ты профессиональный ИИ-тренер, создающий планы тренировок. Выводи ответ строго в текстовом формате."
                        },
                        {
                            role: "user",
                            content: JSON.stringify(userData)
                        }
                    ],
                    temperature: 0.7
                })
            }
        );

        if (!response.ok) {
            const errData = await response.text();
            console.error("OpenAI API Error:", errData);
            return res.status(500).json({ error: "Ошибка API OpenAI", details: errData });
        }

        const data = await response.json();
        
        if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
             throw new Error(`Invalid API response format: ${JSON.stringify(data)}`);
        }

        res.json(data.choices[0].message);
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Внутренняя ошибка сервера", details: error.message });
    }
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});