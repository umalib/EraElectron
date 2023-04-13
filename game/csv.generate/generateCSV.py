# -*- coding: utf-8 -*-

sourceFile = open('./uma-data.csv', 'r', encoding='utf_8_sig')
lines = sourceFile.read().split('\n')
sourceFile.close()

header = lines[0].split(',')
for i in range(1, len(lines)):
	charaLine = lines[i].split(',')
	if charaLine[19] == '':
		continue
	fileName = 'Chara%s %s.csv' % (charaLine[0], charaLine[2])
	print(fileName)
	content = ''
	for j in range(1,len(header)):
		colName = header[j]
		colValue = charaLine[j]
		if j == 12:
			if len(colValue) == 2:
				colValue = 0
			else:
				colValue = ord(colValue) - ord('A') + 1
		elif j >= 29 and j <= 38:
			colValue = ord('G') - ord(colValue)
		colName = colName.replace('|', ',')
		content += '%s,%s\n' % (colName, colValue)

	destFile = open('./tmp/' + fileName, 'w', encoding='utf_8_sig')
	destFile.write(content)
	destFile.close()