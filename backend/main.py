import uvicorn  
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from generate import generateIntegerMultiplcation,generateClosedPair,closestPairRun,integerMultiplicationRun
import os

app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_credentials=True,
    allow_headers=["*"]
)

loads=[]

@app.post("/api/generate")
def generate_files(body: dict):
    algo = body["algo"]    
    if algo == "closedPair":
        out=generateClosedPair()
    else:
        out=generateIntegerMultiplcation()

    return {"files": out}

@app.post("/api/load")
def load_file(body: dict):
    file = body["file"]
    algo = body["algo"]
    with open(f"../files/{algo}/{file}") as f:
        lines = [l for l in f.read().splitlines() if l.strip()]
    n = int(lines[0])
    rows = [line.split() for line in lines[1:n + 1]]
    rows = [[x, y] for x, y in rows]
    load_id=str(len(loads) + 1)
    loads.append({'loadId':load_id,'answer':0, 'file':file,'rows':n, 'summary':rows})
    return {"loadId":load_id,"summary": f"{len(rows)}",'points':rows}

@app.post("/api/start")
def getRunning(body:dict):
    loadId=body['loadId']
    algo=body['algo']
    points=[]
    for i in loads:
        if i['loadId']==loadId:
            points=i['summary']
    if algo=="closedPair":
        answer=closestPairRun(points)
    elif algo=="integerMultiplication":
        answer=integerMultiplicationRun(points)
    return answer
    




if __name__=="__main__":
    uvicorn.run("main:app",host="0.0.0.0",port=8000)
