import json
# from youtubesearchpython import VideosSearch

with open("data.tsv", "r") as f:
    data = f.read()
lines = data.split('\n')

years = []

for line in lines:
    song = line.split('\t')
    year = int(song[3])
    search_query = song[2] + " " + song[1]
    # videosSearch = VideosSearch(search_query, limit = 1)
    # video_id = str(videosSearch.result()["result"][0]["id"])
    # track = {"title":song[2], "artist":song[1], "year":year, "video_id":video_id}
    track = {"title":song[2], "artist":song[1], "year":year}
    years.append(track)
    print(track)

json_object = json.dumps(years, indent = 4) 
print(json_object)

f = open("tracks.json", "w")
f.write(json_object)
f.close()