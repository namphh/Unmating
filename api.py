import mariadb
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Form
from fastapi.responses import JSONResponse
import uvicorn
import requests
import random  # Import random module

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/read_data")
async def read_data():
    # Generate a random list of 15 numbers between 100 and 10,000
    random_data = [random.randint(100, 10000) for _ in range(100)]
    return JSONResponse(content={"data": random_data})

@app.get("/check_data")
async def check_data():
    return JSONResponse(content={"data": [1]})

@app.get("/write_data")
async def write_data():
    return JSONResponse(content={"data": 'successful write'})

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
