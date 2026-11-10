# Algorithm Visualizer

A basic algorithm visualizer for two divide and conquer algorithms: Closest Pair of Points and Integer Multiplication 
**Stack:** React, TypeScript, Vite and Tailwind CSS (frontend). Python and FastAPI (backend).

## Members

| #   | Name            | Roll number |
| --- | --------------- | ----------- |
| 1   | Huzaif Ali Shah | 24K-0640    |
| 2   | Hardeep Naresh  | 24K-0653    |
| 3   | Shahbaz Hassan  | 24K-0884    |

## Requirements

| Method | You need |
|--------|----------|
| Docker Compose | Docker Desktop, running |
| Manual | Python 3.11+ and Node.js 20+ (the versions the Docker images use) |
## Method 1: Docker Compose

From the project root (the folder that contains `docker-compose.yaml`):
```bash
docker compose up --build
```
When both containers are up, open **http://localhost:5173**.

## Method 2: Manual (venv + npm)

Use two terminals, one for the backend and one for the frontend. Start the backend first.
### Terminal 1: backend
```bash
cd backend
python -m venv venv
```

Activate the virtual environment (use the line for your shell):

```bash

venv\Scripts\activate          # Windows, Command Prompt
venv\Scripts\Activate.ps1      # Windows, PowerShell
source venv/Scripts/activate   # Windows, Git Bash
source venv/bin/activate       # macOS / Linux

```
Then install the packages and start the server:

```bash
pip install -r requirements.txt
python main.py
```

The API is now running on **http://localhost:8000**. Keep this terminal open.

### Terminal 2: frontend
```bash

cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

## Ports and links

| What                        | Link                  |
| --------------------------- | --------------------- |
| **The app (open this one)** | http://localhost:5173 |
| Backend API                 | http://localhost:8000 |

Both must be running at the same time, because the app talks to the backend on port 8000. The links are the same for both install methods.

## How to use

1. Open http://localhost:5173 and choose **Closest Pair of Points** or **Integer Multiplication**.
2. Press **Refresh** to list the existing input files, or **Generate** to create new random ones.
3. Press **Select** next to a file, then **Load**. The file's content is shown.
4. Press **Start** to run the algorithm.
5. Press **Move to Result** to save the outcome to the Results list at the bottom of the page.
6. Export the Results list as CSV, or use **Clear** to empty it. Each algorithm keeps its own results.

