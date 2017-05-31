import markdown, json
from yattag import Doc, indent


# fonction d'ouverture et traduction des documents markdown
def readMDfile(mdfile):

    with open("md/" + mdfile + ".md", mode="r", encoding="utf-8") \
    as mdInput:
        texte = mdInput.read()
        mdOutput = markdown.markdown(texte, ["markdown.extensions.extra"])

        # clearing useless p tag around img tags
        while mdOutput.find("<p><img") != -1:
            i = mdOutput.find("<p><img")
            x = mdOutput.find("</p>", i)
            print(i,x)
            mdOutput = mdOutput[0:i] + mdOutput[i+3:x] + mdOutput[x+4:]

        print(mdOutput)
    return mdOutput


def readJSONfile(jsonfile):

    with open(jsonfile + ".json", mode="r", encoding="utf-8") as f:
        jsonInput = json.load(f)
    return jsonInput


class MainIndex():

    def __init__(self, configFile):
        doc, tag, text, line = Doc().ttl()

        doc.asis("<!DOCTYPE html>")

        info = readJSONfile(configFile)

        with tag("html", lang="fr"):
            doc.asis(self.head(info))
            doc.asis(self.body(info["menu"]))

        with open("../website/index.html","w") as output:
            output.write(indent(doc.getvalue()))


    def head(self, info):

        doc, tag, text, line = Doc().ttl()

        with tag("head"):
            with tag("title"):
                text(info["title"])

            doc.stag("meta", ("http-equiv","Content-Type"),
                content="text/html; charset=UTF-8")

            for meta in info["meta"]:
                doc.stag("meta", name=meta["name"], content=meta["content"])
            for link in info["link"]:
                doc.stag("link", rel=link["rel"], href=link["href"])

            doc.stag("link", rel="icon", type="image/png",
            href="imgs/favicon.png")

        return doc.getvalue()


    def body(self, menu):

        doc, tag, text, line = Doc().ttl()

        def generateMenu(menu):
            for entry in menu:
                with tag("li"):
                    with tag("a", klass="menu"):
                        if "href" in entry:
                            doc.attr(href=entry["href"])
                        else:
                            doc.attr(id=entry["id"])
                        text(entry["content"])


        with tag("body"):
            with tag("div", id="main"):
                with tag("section", id="appendZone"):
                    text("zone ou intégrer les différentes parties")

                with tag("section", klass="sidebar"):
                    with tag("ul"):
                        generateMenu(menu)

            with tag("script", src="script.js"): text()

        return doc.getvalue()



class Sections():

    def __init__(self, info):
        doc, tag, text, line = Doc().ttl()

        self.info = info

        if self.info["id"] == "journal":
            doc.asis(self.journal())
        elif self.info["id"] == "categories":
            doc.asis(self.categories())
        else:
            doc.asis(readMDfile(self.info["fichierMD"]))

        with open("../website/html/" + info["id"]+ ".html","w") as output:
            output.write(indent(doc.getvalue()))

    def journal(self):

        doc, tag, text, line = Doc().ttl()

        with tag("div", klass="onglet flex entete"):
            line("h4", "titre")
            line("p", "date", klass="date")

        for ep in self.info["episodes"]:
            with tag("article"):
                with tag("div", klass="onglet flex target"):
                    line("h4", ep["titre"])
                    line("p", ep["date"], klass="date")
                    line("p", "lire", klass="lien")

                print(readMDfile("ep/"+ep["fichierMD"]))

                with tag("div", id=ep["fichierMD"], klass="episode"):
                    doc.asis(readMDfile("ep/"+ep["fichierMD"]))

        return doc.getvalue()

    def categories(self):

        doc, tag, text, line = Doc().ttl()

        with tag("div", klass="onglet flex entete"):
            line("h4", "medias")
            line("p", "nombre (?)", klass="date")

        for cat in self.info["medias"]:
            with tag("article"):
                with tag("div", klass="onglet flex target"):
                    line("h4", cat)
                    line("p", "5", klass="date")
                    line("p", "ouvrir", klass="lien")

                with tag("div", klass="episode"):
                    text("trad du markdown -> "+ cat.lower() + ".md")

        return doc.getvalue()



MainIndex("index")

categories = readJSONfile("categories")

for categorie in categories:
    Sections(categorie)
