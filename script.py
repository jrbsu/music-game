import json

with open("data.tsv", "r") as f:
    data = f.read()
lines = data.split('\n')

years = []

for line in lines:
    song = line.split('\t')
    print(song)
    year = int(song[3])
    track = {"title":song[2], "artist":song[1], "year":year}
    years.append(track)

json_object = json.dumps(years, indent = 4) 
print(json_object)

f = open("tracks.json", "w")
f.write(json_object)
f.close()