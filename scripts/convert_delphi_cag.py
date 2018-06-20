import json
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("-f", "--file", help="Delphi file")
args = parser.parse_args()

with open(args.file) as json_file:
    data = json.load(json_file)
    cag = {
        "name": data['name'],
        "variables": [],
        "links": []
    }
    for v in data['variables']:
        vid = v['name'].replace(" ", "_")
        cag["variables"].append({
            "id": vid,
            "standard_name": vid,
            "name": v["name"]
        })
        for arg in v['arguments']:
            argid = arg.replace(" ", "_")
            cag["links"].append({
                "from": argid,
                "to": vid
            })

    print(json.dumps(cag, indent=4, separators=(',', ': ')))
