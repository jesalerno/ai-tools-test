# API Usage

## Health Check

### Request

`GET /api/health`

### Response

```json
{ "status": "ok" }
```

## Generate Card

### Request

`POST /api/cards/generate`

```json
{
  "method": "MANDELBROT",
  "seed": "demo-seed-1"
}
```

`method` may be omitted to use random/surprise mode.

### Response

```json
{
  "imageDataUri": "data:image/jpeg;base64,...",
  "selectedMethod": "MANDELBROT",
  "seed": "demo-seed-1",
  "metadata": {
    "durationMs": 0,
    "retries": 0,
    "warnings": [],
    "coverage": 0.9,
    "harmonyMode": "TRIAD"
  }
}
```

### Error Shape

```json
{
  "error": "VALIDATION_ERROR",
  "message": "human-readable explanation"
}
```
