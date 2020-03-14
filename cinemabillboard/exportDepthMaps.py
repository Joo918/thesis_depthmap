from paraview import lookuptable
import os
import time
import math
import numpy as np
from string import Template

#########################################################################
#User parameters

#number of divisions in theta angle from -180 to 180 degrees
thetaSteps = 7 #UNUSED ATM. DIRECTLY CHANGE 38
#number of divisions in phi angle from -90 to 90 degrees
phiSteps = 1 #UNUSED ATM. DIRECTLY CHANGE 39
#which columns to put for x,y,z axis
xyz = ['x','y','z']
#which column to color by (for the actual image, not the depth map)
colorby = ['col']

csvDirectory = 'D:/thesis/Thesis/Thesis/spheres/sphere1_125.csv'
colormapDirectory = 'D:/thesis/Thesis/Thesis/cinemabillboard/HeatColormap.xml'
exportDirectory = 'D:/thesis/Thesis/Thesis/cinemabillboard/dmap_sphere/sphere1_125/'
maxMinFile = 'D:/thesis/Thesis/Thesis/cinemabillboard/maxmin.txt'

#########################################################################

if os.path.exists(maxMinFile):
	os.remove(maxMinFile)
f = open(maxMinFile, 'w+')
#max min
f.write('-99999999999999.99 99999999999999.99')
f.close()

thetaSize = 360 / thetaSteps
phiSize = 180 / phiSteps

#get the camera angles to take images from
thetas = np.array([-45,-30,-15,0,15,30,45])#np.arange(-180, 180, thetaSize)
phis = np.array([0])#np.arange(-90, 90, phiSize)

print('thetas: ', thetas)
print('phis: ', phis)

prog_source_temp = Template('''

import numpy as np
from vtk.util import numpy_support

data = np.genfromtxt('$csv',
dtype=float, names=True, delimiter=',', autostrip=True)
#print(data.dtype.names)
data2 = np.array(data.tolist(),dtype=float)
#print(data2)
#print(len(data.dtype.names))
#print(data2.shape)

#output.RowData.append(data, data.dtype.names)
for i in range(data2.shape[1]):
	output.RowData.append(data2[:,i], list(data.dtype.names)[i])

xyzdat = np.array(data[$cols].tolist(),dtype=float)
vtk_data_array = numpy_support.numpy_to_vtk(xyzdat)
output.RowData.SetScalars(vtk_data_array)
#print(output.RowData)

''')

#read the csv file
reader = ProgrammableSource()
reader.OutputDataSetType = 'vtkTable'
reader.Script = prog_source_temp.substitute(csv=csvDirectory,cols=xyz)
reader.UpdatePipeline()
Hide()

#a reference table-to-points to set up camera anchor and position
ttpn = TableToPoints(reader)
ttpn.KeepAllDataArrays = True
ttpn.XColumn = xyz[0]
ttpn.YColumn = xyz[1]
ttpn.ZColumn = xyz[2]

ttpn.UpdatePipeline()
Show(ttpn)
ResetCamera()
Hide(ttpn)
view = GetActiveView()
cam = GetActiveCamera()
#camera focal point
view.CameraFocalPoint = [0, 0, 0]
cam_fp = view.CameraFocalPoint
#camera distance from focal point
cam.SetPosition(0, 0, 5.2)
cam_dist = cam.GetDistance()
view.OrientationAxesVisibility = 0

calculationScriptTemplate = Template(
'''
import numpy as np
import os
from vtk.util import numpy_support

print("np v: ", np.version.version)
maxminfile = '$maxmin'

maxmin = open(maxminfile, 'r')
maxminstr = maxmin.read()
maxmin.close()

maxminstrs = maxminstr.split()
max = float(maxminstrs[0])
min = float(maxminstrs[1])

theta = $thetaVal
phi = $phiVal
campos = np.array($campos,dtype=float)
focal = np.array($camfoc,dtype=float)

print("theta = ", theta, "phi = ", phi)
vtk_data = self.GetInput().GetRowData()
#print(vtk_data)

#data_np columns 0,1,2 = x, y, z coordinates of points
data_np = numpy_support.vtk_to_numpy(vtk_data.GetScalars())

print("data np:")
print(data_np)

cam_to_foc = focal - campos
cam_to_foc_norm = cam_to_foc / np.linalg.norm(cam_to_foc)
cam_to_pts = data_np - campos
distances = cam_to_pts.dot(cam_to_foc_norm)
print(distances.shape)

#print("distances: ")
#print(distances)

interestedColumns = $iCols

output.RowData.append(distances, "distances")
print(interestedColumns)
for i in range(len(interestedColumns)):
	#print("getting column: ", interestedColumns[i])
	curCol = self.GetInput().GetColumnByName(interestedColumns[i])
	#print(curCol)
	output.AddColumn(curCol)

print("output:")
print(output.RowData)
	
newmax = distances.max()
newmin = distances.min()

if newmax >= max:
	max = newmax
if newmin <= min:
	min = newmin

newmaxmin = str(max) + ' ' + str(min)

f = open(maxminfile, 'w+')
#max min
f.write(newmaxmin)
f.close()

''')
ppfs = {}
ttps = {}

lr_d = lookuptable.vtkPVLUTReader()
lr_d.Read(colormapDirectory)

for i in range(thetaSteps):
	for j in range(phiSteps):
		x = cam_fp[0] + cam_dist * math.cos(math.radians(phis[j])) * math.sin(math.radians(thetas[i]))
		z = cam_fp[2] + cam_dist * math.cos(math.radians(phis[j])) * math.cos(math.radians(thetas[i]))
		y = cam_fp[1] + cam_dist * math.sin(math.radians(phis[j]))
		cam.SetPosition(x,y,z)
		ppf = ProgrammableFilter(reader)
		ppf.Script = calculationScriptTemplate.substitute(thetaVal=thetas[i],phiVal=phis[j],campos=[x,y,z],camfoc=cam_fp,maxmin=maxMinFile, iCols=xyz+colorby)
		ppf.UpdatePipeline()
		ppfs[(thetas[i],phis[j])] = ppf
		
		ttp = TableToPoints(ppfs[(thetas[i],phis[j])])
		ttp.KeepAllDataArrays = True
		ttp.XColumn = xyz[0]
		ttp.YColumn = xyz[1]
		ttp.ZColumn = xyz[2]
		
		rep = Show(ttp)
		rep.ColorArrayName = 'distances'
		arr = ttp.PointData.GetArray('distances')
		lut = lr_d.GetLUT(arr, 'Depth')
		rep.LookupTable = lut
		
		ttp.UpdatePipeline()
		ttps[(thetas[i],phis[j])] = ttp
		
		##export image name format: 'phi=x_theta=y.png' and 'phi=x_theta=y_depth.png' for phi x and theta y
		SaveScreenshot(exportDirectory + 'phi=' + str(phis[j]) + '_theta=' + str(thetas[i]) + '_depth.png', TransparentBackground=1, ImageResolution=(512,512))
		
		for colorchoice in range(len(colorby)):
			rep.ColorArrayName = colorby[colorchoice]
			arr = ttp.PointData.GetArray(colorby[colorchoice])
			lut = lr_d.GetLUT(arr, 'Heat')
			rep.LookupTable = lut
			
			SaveScreenshot(exportDirectory + 'phi=' + str(phis[j]) + '_theta=' + str(thetas[i]) + '_' + colorby[colorchoice] +'.png', TransparentBackground=1, ImageResolution=(512,512))
		
		Hide(ttp)
		

##remove temp files
#os.remove(maxMinFile)