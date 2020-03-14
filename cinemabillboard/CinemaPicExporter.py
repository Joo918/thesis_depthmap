from paraview import lookuptable
import os
import time

rootRoute = "C:/Users/joo918/Desktop/Jlab/testbase/img"


reader = CSVReader(FileName='C:/Users/joo918/Desktop/Jlab/K+Filtered_HERMES.csv')
Hide()

############################QZP BELOW 0.5

ppf_init = ProgrammableFilter(reader)
ppf_init.Script = "execfile('C:/Users/joo918/Desktop/Jlab/K+CinemaExport_Randomize/qzp_below0p5.py')"
ppf_init.UpdatePipeline()
ppf_init2 = ProgrammableFilter(reader)
ppf_init2.Script = "execfile('C:/Users/joo918/Desktop/Jlab/K+CinemaExport_Randomize/qzp_between0p5and1p5.py')"
ppf_init2.UpdatePipeline()
ppf_init3 = ProgrammableFilter(reader)
ppf_init3.Script = "execfile('C:/Users/joo918/Desktop/Jlab/K+CinemaExport_Randomize/qzp_above1p5.py')"
ppf_init3.UpdatePipeline()

#ppf = ProgrammableFilter(ppf_init)

#ppf.Script = "execfile('C:/Users/joo918/Desktop/Jlab/density.py')"

filename2 = 'C:/Users/joo918/Desktop/Jlab/K+CinemaExport_Randomize/n.txt'
f = open(filename2, 'r')
n = int(f.read())
f.close()

view = GetActiveView()
#view.CameraPosition = [0.44682105630636215, 0.7039180397987366, 2.3448283991103045]
#view.CameraViewAngle = 30.0
#view.CameraViewUp = [0.0, 1.0, 0.0]
view.ViewSize = [350, 400]

lr = lookuptable.vtkPVLUTReader()
lr.Read('C:/Users/joo918/Desktop/Jlab/K+CinemaExport_Randomize/HeatColormap.xml')

ppflist = []
ppfdlist = []
ttplist = []
pvilist = []
cntrlist = []
for i in range(n):
	ppfn = ProgrammableFilter(ppf_init)
	ppfn.Script = "execfile('C:/Users/joo918/Desktop/Jlab/K+CinemaExport_Randomize/divN.py')"
	ppflist.append(ppfn)
	
	ppfdn = ProgrammableFilter(ppfn)
	ppfdn.Script = "execfile('C:/Users/joo918/Desktop/Jlab/density.py')"
	ppfdlist.append(ppfdn)
	
	ttpn = TableToPoints(ppfdn)
	ttpn.KeepAllDataArrays = True
	ttpn.XColumn = 'x'
	ttpn.YColumn = 'y'
	ttpn.a2DPoints = True
	ttplist.append(ttpn)
	
	ttpn.UpdatePipeline()
	
	pvin = PointVolumeInterpolator(Input=ttpn, Source='Bounded Volume')
	#pvin.Kernel = 'VoronoiKernel'
	#pvin.Locator = 'Static Point Locator'
	
	#pvin.Source.Origin = [0.18169739842414856, 0.18169739842414856, 0.0]
	#pvin.Source.Scale = [1.0089641511440277, 2.6763417571783066, 0.0]
	pvin.UpdatePipeline()
	
	pvilist.append(pvin)
	
	cntrn = Contour(pvin)
	cntrn.ComputeScalars = True
	cntrn.Isosurfaces = [1, 1.7, 3, 6, 10]
	cntrlist.append(cntrn)
	
	view = GetActiveView()
	#view.ViewSize = [350, 400]
	#view.CameraPosition = [0, 0, 0]
	#view.CameraFocalPoint = [0, 0, -1]
	rep = Show(cntrn)
	if i != 0:
		Hide(cntrlist[i - 1])
	#Show(ttpn)
	dp = GetDisplayProperties()
	dp.Representation = 'Wireframe'
	dp.LineWidth = 5
	dp.DataAxesGrid.GridAxesVisibility = 1
	dp.DataAxesGrid.XTitle = 'z'
	dp.DataAxesGrid.YTitle = 'P_hperp'
	#dp.UpdatePipeline()
	rep.ColorArrayName = 'density'
	arr = cntrn.PointData.GetArray('density')
	lut = lr.GetLUT(arr, 'Heat')
	rep.LookupTable = lut
	if i == 0:
		ResetCamera()
	#time.sleep(1)
	#Render()
	
	
	WriteImage('C:/Users/joo918/Desktop/Jlab/K+CinemaExport_Randomize/Exports/' + filenamePrefix + str(i) + '.png')