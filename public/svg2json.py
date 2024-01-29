import json
import sys
from xml.dom import minidom
import argparse as ap


def get_id(filename: str) -> str:
    # use filename without extension
    return filename.split("/")[-1].split(".")[0]


def parse_args():
    parser = ap.ArgumentParser()
    parser.add_argument("input", help="SVG file to parse")
    parser.add_argument("output", help="JSON file to write to")
    return parser.parse_args()


def parse_svg(filename: str) -> minidom.Document:
    return minidom.parse(filename)  # parseString also exists


def id_to_name(id: str) -> str:
    # split on underscores, capitalize non-conjunctions, join with spaces
    return " ".join([word.capitalize() if word not in ["of", "and", "in"] else word for word in id.split("_")])


def main():
    args = parse_args()
    svg = parse_svg(args.input)
    g_items = svg.getElementsByTagName("g")
    countries_g: minidom.Element = [g for g in g_items if g.getAttribute("inkscape:label") == "countries"][0]
    countries_paths = countries_g.getElementsByTagName("path")

    countries_json = {
        "id": get_id(args.input),
        "name": id_to_name(get_id(args.input)),
        "viewBox": f"0 0 {svg.documentElement.getAttribute('width')} {svg.documentElement.getAttribute('height')}",
        "layers": [
            {
                "id": path.getAttribute("id"),
                "name": id_to_name(path.getAttribute("id")),
                "d": path.getAttribute("d"),
            } for path in countries_paths
        ]
    }

    with open(args.output, "w") as f:
        json.dump(countries_json, f)


if __name__ == "__main__":
    main()
