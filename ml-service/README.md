# TrendScout ML Service

Microservice для машинного обучения, обрабатывает:
- CLIP embeddings (текст и изображения)
- AI генерацию текста через Anthropic Claude

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Настройка переменных окружения

Создайте файл `.env`:

```env
PORT=8001
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 3. Запуск сервиса

```bash
python -m app.main
```

Сервис запустится на: **http://localhost:8001**

API документация: **http://localhost:8001/docs**

## 📚 API Endpoints

### Health Check
- `GET /` - Проверка статуса сервиса

### CLIP Embeddings
- `POST /embeddings/text` - Генерация embedding для текста
- `POST /embeddings/image` - Генерация embedding для изображения
- `POST /embeddings/batch-images` - Batch обработка изображений

### AI Generation
- `POST /ai/trend-summary` - Генерация AI описания тренда

## 🛠 Технологии

- **FastAPI** - Web framework
- **PyTorch** - Deep learning framework
- **Transformers** - HuggingFace transformers
- **CLIP** - OpenAI CLIP model (vit-base-patch32)
- **Anthropic Claude** - AI text generation

## 📦 Deployment

### Railway / Render

1. Подключите GitHub репозиторий
2. Установите переменные окружения:
   - `ANTHROPIC_API_KEY`
3. Build command: `pip install -r requirements.txt`
4. Start command: `python -m app.main`

### Docker (опционально)

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "-m", "app.main"]
```

## 🔒 Безопасность

- Используйте переменные окружения для API ключей
- Настройте CORS для production
- Ограничьте rate limiting для API endpoints

## 📝 Примеры использования

### Text Embedding
```bash
curl -X POST http://localhost:8001/embeddings/text \
  -H "Content-Type: application/json" \
  -d '{"text": "viral dance trend"}'
```

### Image Embedding
```bash
curl -X POST http://localhost:8001/embeddings/image \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://example.com/image.jpg"}'
```

### AI Summary
```bash
curl -X POST http://localhost:8001/ai/trend-summary \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Dance challenge with trending sound",
    "views": 1500000
  }'
```
