import numpy as np

geonArr = []
nocommas = []
#counts how many permutations start with 0-7. Each should have 3
counts = [0] * 8

def compareGeonArr(toCompare):
    startVal = toCompare[0]
    if counts[startVal] >= 3:
        return False

    for i in geonArr:
        comp = (i == toCompare)
        if comp.all():
            return False

    counts[startVal] = counts[startVal] + 1
    return True

for i in range(24):
    permute = np.random.permutation(8)
    while not compareGeonArr(permute):
        permute = np.random.permutation(8)
    geonArr.append(permute)

for i in geonArr:
    stri = ""
    for j in i:
        stri += str(j)
    nocommas.append(stri)

print(nocommas)