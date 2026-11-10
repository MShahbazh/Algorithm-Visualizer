import random
import sys
import os
from math import dist

def generateClosedPair():
    path="../files/closedPair/"
    for i in range(10):
        numbers=random.randint(101,500)
        arr=[]
        with open(f"{path}file{i+1}.txt" ,"w") as file:
            file.write(f"{numbers}\n")
            for j in range(numbers):
                while True:
                    a=random.randint(1,200)
                    b=random.randint(1,200)
                    duplicate=False
                    for k in arr:
                        if k[0]==a and k[1]==b:
                            duplicate=True
                            break
                    if not duplicate:
                        break
                arr.append([a,b])
                file.write(f"{a} {b}\n")
        file.close()
    arr=[]
    with os.scandir(path) as file:
         for entry in file:
                arr.append({"name":entry.name,"size":entry.stat().st_size})
    return arr
        
    


def generateIntegerMultiplcation():
    path="../files/integerMultiplication/"
    for i in range(10):
        numbers=random.randint(101,500)
        arr=[]
        with open(f"{path}file{i+1}.txt" ,"w") as file:
            file.write(f"{numbers}\n")
            for j in range(numbers):
                while True:
                    a=random.randint(1,10000000)
                    b=random.randint(1,10000000)
                    duplicate=False
                    for k in arr:
                        if k[0]==a and k[1]==b:
                            duplicate=True
                            break
                    if not duplicate:
                        break
                arr.append([a,b])
                file.write(f"{a} {b}\n")
        file.close()
    arr=[]
    with os.scandir(path) as file:
         for entry in file:
                arr.append({"name":entry.name,"size":entry.stat().st_size})
    return arr


def add(kind,steps,**state):
    steps.append({"stepNo": len(steps) + 1, "state": {"type": kind, **state}})

def solve(low,high,points,steps):
    part=points[low:high]
    if len(part)<=3:
        best=(float("inf"),None,None)
        for i in range(len(part)):
            for j in range(i+1,len(part)):
                d=dist(part[i],part[j])
                if d<best[0]:
                    best=(d,part[i],part[j])
        if best[1] is None:
            delta = None
        else:
            delta = best[0]
        add("base",steps, points=part, best=[best[1], best[2]],delta=delta)
        return best

    mid=low+(high-low)//2
    
    lines=points[mid][0]
    add("divide",steps,points=part,line=lines)
    left=solve(low,mid,points,steps)
    right=solve(mid,high,points,steps)
    best=min(left, right)
    add("merge",steps,points=part,line=lines,delta=best[0],best=[best[1],best[2]])

    strip = sorted((p for p in part if abs(p[0] - lines) < best[0]), key=lambda p: p[1])
    add("strip",steps, line=lines, delta=best[0], strip=strip, best=[best[1], best[2]])

    for i in range(len(strip)):
            for j in range(i + 1, len(strip)):
                if strip[j][1] - strip[i][1] >= best[0]:
                    break
                d = dist(strip[i], strip[j])
                if d < best[0]:
                    best = (d, strip[i], strip[j])
                add("compare",steps, a=strip[i], b=strip[j], d=d, line=lines,delta=best[0], best=[best[1], best[2]])
    return best

def closestPairRun(points):
    sorted=[]
    for i in range(len(points)):
        points[i][0],points[i][1]=int(points[i][0]),int(points[i][1])
    for i in range(len(points)):
        for j in range(len(points)-i-1):
            if points[j][0] > points[j + 1][0]:
                points[j], points[j + 1] = points[j + 1], points[j]
            elif points[j][0] == points[j + 1][0]:
                if points[j][1] > points[j + 1][1]:
                    points[j], points[j + 1] = points[j + 1], points[j]
    steps=[]
    d,p,q=solve(0, len(points),points,steps)
    add("done", steps,best=[p, q], delta=d)
    return {"answer": {"points": [p, q], "distance": d}, "steps": steps}

def karatsuba(x,y):
    if x<10 or y<10:
        return x*y
    maxSize=max(len(str(x)),len(str(y)))//2
    p=10**maxSize

    a=x//p
    b=x%p
    c=y//p
    d=y%p 
    ac=karatsuba(a,c)
    bd=karatsuba(b,d)
    last=karatsuba(a+b,c+d)-ac-bd

    return ac*p*p+last*p+bd


def integerMultiplicationRun(points):
    answer=[]
    for i in range(len(points)):
        points[i][0],points[i][1]=int(points[i][0]),int(points[i][1])
    for i in range(len(points)):
        answer.append({"a":points[i][0],"b":points[i][1],"Product":karatsuba(points[i][0],points[i][1])})
    return {"answer":answer}