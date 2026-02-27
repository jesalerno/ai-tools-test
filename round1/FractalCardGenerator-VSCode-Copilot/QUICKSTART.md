# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Option 1: Docker (Recommended - Easiest)

**Prerequisites:** Docker and Docker Compose installed

1. **Clone and navigate:**
   ```bash
   cd FractalCardGenerator-CC
   ```

2. **Start the application:**
   ```bash
   docker-compose up --build
   ```

3. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

4. **Generate your first card:**
   - Select a fractal method from dropdown
   - Click "Go" or "Surprise Me"
   - Watch your fractal card appear!

5. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Option 2: Local Development

**Prerequisites:**
- Node.js 20+
- System libraries for canvas

**Install System Dependencies:**

macOS:
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
```

Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev \
  libjpeg-dev libgif-dev librsvg2-dev pixman-dev
```

**Start Backend:**
```bash
cd backend
npm install
npm run dev
```

**Start Frontend (new terminal):**
```bash
cd frontend
npm install
npm start
```

**Access:** http://localhost:3000

## 🎯 First Steps

### 1. Try the "Surprise Me" Button
- Fastest way to see different fractals
- Randomly selects from all 11 methods
- Each generation is unique

### 2. Explore Each Fractal Method
- **Mandelbrot**: Classic fractal with intricate borders
- **Julia**: Beautiful symmetrical patterns
- **Newton**: Colorful convergence basins
- **Strange Attractor**: Chaotic but structured patterns

### 3. Observe the Patterns
- All cards are seamlessly symmetric
- 4-quadrant design (no distinct top/bottom)
- Print-ready quality (300 DPI)
- 3mm white borders with rounded corners

## 🧪 Run Tests

```bash
cd backend
npm test
```

All tests should pass!

## 📊 Check API Health

```bash
curl http://localhost:8080/api/health
```

Should return: `{"status":"ok","timestamp":"..."}`

## 🔍 View Available Methods

```bash
curl http://localhost:8080/api/methods
```

Returns list of all 11 fractal methods.

## 💡 Tips

1. **Generation Time**: Complex fractals may take 5-10 seconds
2. **Different Results**: Each generation creates a unique design
3. **Refresh Page**: To reset the UI
4. **Docker Logs**: `docker-compose logs -f` to see backend logs

## ❓ Troubleshooting

### "Connection refused" Error
- Check backend is running: `curl http://localhost:8080/api/health`
- Verify Docker containers: `docker-compose ps`

### Slow Generation
- Normal for complex fractals (Flame, Strange Attractor)
- Be patient, it's working!

### Canvas Build Errors
- Install system dependencies (see above)
- Use Docker instead (dependencies included)

## 📖 Learn More

- **Full Documentation**: See [README.md](README.md)
- **Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Requirements**: See [SPECIFICATION.md](SPECIFICATION.md)

## 🎉 You're Ready!

Start generating beautiful fractal cards and exploring the fascinating world of fractal mathematics!

---

**Need Help?** Check the [README.md](README.md) troubleshooting section
