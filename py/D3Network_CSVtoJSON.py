#! /usr/bin/env python
import csv
import json

f = open( '../data/Gwinnett_College - Copy of Sheet1.csv', 'rU' )
reader = csv.DictReader( f, dialect='excel')
nodeArr = []
linkArr = []
keyArr = [] #have a parallel key array so we can look up the index we want from the nodeArr
#reader = csv.DictReader( f, fieldnames = ( "Name","Link","Name or organization","Notes")) #doing it this way will put row 1 into your data - exclude fieldnames to use row 1 as fieldnames
num = 0
num2 = 0

for i, row in enumerate(reader):
	#check if node is in nodeArr yet, and if not add it
	node = row['Name']
	if node not in keyArr:
		keyArr.append(node)
		num = len(keyArr)-1
		nodeArr.append({"name": row['Name'], "title": row['Title']})

	else:
		num = keyArr.index(node)

	#check if node2 is in nodeArr yet
	node2 = row['Name or organization']
	if node2 not in keyArr:
		keyArr.append(node2)
		num2 = len(keyArr)-1
		nodeArr.append({"name": row['Name or organization'], "title": row['Title2']})

	else:
		num2 = keyArr.index(node2)

	#add link between node and node2
	linkArr.append({"source": num, "target": num2, "connection": row['Link'], "notes": row['Description']})

tree = {"nodes": nodeArr, "links": linkArr}
out = json.dumps(tree, indent=4)

#print out
f = open( '../data/network2_raw.json', 'w')
f.write(out)
print "JSON saved!"