import os
import math

fileLoc = "C:/Users/Ajidot/Desktop/vt_stuff/Thesis/spheres/sphere1_125.csv"
dpm = 300 #dots per meter boundary
xylen = 1.0 / 2 #half diameter in x and y direction. Circle radius
zlen = 1.125 / 2 #half diameter in z direction

bckx = 1.5
bcky = 1.5
##################################

#x^2/a^2 + y^2/b^2 = 1

#calculate half z len of oval at z (len of a)
def calcZatY(y):
    result = math.sqrt(zlen**2 * (1 - float(y**2) / (xylen**2)))
    #print("calcZatY(" + str(y) + "): " + str(result))
    return result
#calculate half x len of oval at y (len of b)
def calcXatY(y):
    result = math.sqrt(xylen**2 - y**2)
    #print("calcXatY(" + str(y) + "): " + str(result))
    return result

#calculate the point coordinates of an ellipse defined by a and b and at angle theta (radians)
def ptOnEllipse(a, b, theta):
    return [a * math.cos(theta), b * math.sin(theta)]

#estimate circumference at y
def calcCircAt(y):
    a = calcZatY(y)
    b = calcXatY(y)
    if a < 0.000001 and b < 0.0000001:
        return 0.0
    gamma = float(a-b)/(a+b)
    #Ramanujan estimation
    return math.pi * (a + b) * (1 + (3 * gamma ** 2) / (10 + math.sqrt(4 - 3 * gamma ** 2)))
#calculate the number of points needed around the oval at y
def numPtAtY(y):
    result = calcCircAt(y) * dpm
    #print("numPtAtY(" + str(y) + "):" + str(result))
    return int(result)

pointList = []

#back plane
for i in range(int(dpm * bckx)):
	for j in range(int(dpm * bcky)):
		pointList.append([2,-bckx * 0.5 + float(i) / dpm, -bcky * 0.5 + float(j) / dpm, 0])

numPtsAlongY = int(numPtAtY(0) / 2)
#length delta steps across y axis
delta = float(xylen) * 2 / numPtsAlongY
for i in range(numPtsAlongY):
    curY = -xylen + delta * i
    curNumPt = int(numPtAtY(curY))

    if curNumPt == 0:
        pointList.append([1, 0, curY, zlen])
        continue

    angleDelta = math.pi * 2 / curNumPt
    curA = calcZatY(curY)
    curB = calcXatY(curY)
    for j in range(curNumPt):
        curAngle = angleDelta * j
        curPts = ptOnEllipse(curA, curB,curAngle)

        curCol = 0
        if curPts[0] > 0:
            curCol = 1

        pointList.append([curCol, curPts[1], curY, curPts[0] + zlen])

if os.path.exists(fileLoc):
	os.remove(fileLoc)
f = open(fileLoc, 'w')
f.write('ID,col,x,y,z')

for i in range(len(pointList)):
	cur = pointList[i]
	f.write("\n")
	f.write(str(i))
	for j in cur:
		f.write(","+ str(j))
f.close()
