import mariadb
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Form
from fastapi.responses import JSONResponse
import uvicorn
import requests

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

    return JSONResponse(content={"data": [123,14,25,12,56,24,4,13,1,241,13,1,1412,4124,124]})

@app.get("/check_data")
async def check_data():

    return JSONResponse(content={"data": [1]})

@app.get("/write_data")
async def read_data():

    return JSONResponse(content={"data": 'successful write'})

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)