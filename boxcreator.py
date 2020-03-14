import os

fileLoc = "C:/Users/Ajidot/Desktop/vt_stuff/Thesis/boxes/box1_125.csv"
dpm = 300 #dots per meter
xlen = 1
ylen = 1
zlen = 1.125

bckx = 1.5
bcky = 1.5
################################

pointList = []

#front and back sides
for i in range(int(dpm * xlen)):
	for j in range(int(dpm * ylen)):
		pointList.append([1,-xlen * 0.5 + float(i) / dpm, -ylen * 0.5 + float(j) / dpm, zlen])
		#pointList.append([0,-xlen * 0.5 + float(i) / dpm, -ylen * 0.5 + float(j) / dpm, -zlen * 0.5])

#back plane
for i in range(int(dpm * bckx)):
	for j in range(int(dpm * bcky)):
		pointList.append([2,-bckx * 0.5 + float(i) / dpm, -bcky * 0.5 + float(j) / dpm, 0])

#left and right sides
for i in range(int(dpm * zlen)):
	for j in range(int(dpm * ylen)):
		pointList.append([0,xlen * 0.5, -ylen * 0.5 + float(j) / dpm, float(i) / dpm])
		pointList.append([0,-xlen * 0.5, -ylen * 0.5 + float(j) / dpm, float(i) / dpm])
#bottom and top sides
for i in range(int(dpm * zlen)):
	for j in range(int(dpm * xlen)):
		pointList.append([0,-xlen * 0.5 + float(j) / dpm, ylen * 0.5, float(i) / dpm])
		pointList.append([0,-xlen * 0.5 + float(j) / dpm, -ylen * 0.5, float(i) / dpm])

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