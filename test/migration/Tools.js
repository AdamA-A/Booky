class Fetcher {
    static async fetchAll(urls, parseMethod) {
        return await Promise.all(urls.map(async url => {
            try {
                const resp = await fetch(url);
                return parseMethod == "json" ? resp.json() : (parseMethod == "text" ? resp.text() : (parseMethod == "blob" ? resp.blob() : resp));
            } catch (e) {
                console.error("Unable to fetch " + url);
            }
        }))
    }
}
class GAS {
    static async setSoraLibraries(libraries) {
        //
    }
    static async setLibbyLibraries(libraries) {
        //
    }
    static async getContentUrl(spreadUrl) {
        return "https://asset.epub.pub/epub/ruin-and-rising-by-leigh-bardugo-1.epub/content.opf";
    }
    static async getContentFile(contentUrl) {
        return `<?xml version='1.0' encoding='utf-8'?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uuid_id" version="2.0">
  <metadata xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:opf="http://www.idpf.org/2007/opf" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:calibre="http://calibre.kovidgoyal.net/2009/metadata" xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:publisher>Henry Holt and Co. (BYR)</dc:publisher>
    <dc:language>en</dc:language>
    <dc:creator opf:file-as="Bardugo, Leigh" opf:role="aut">Leigh Bardugo</dc:creator>
    <meta name="calibre:timestamp" content="2014-06-17T09:09:37.458595+00:00"/>
    <dc:title>Ruin and Rising (The Grisha Trilogy)</dc:title>
    <meta name="cover" content="cover"/>
    <dc:date>2014-06-16T22:00:00+00:00</dc:date>
    <dc:contributor opf:role="bkp">calibre (1.40.0) [http://calibre-ebook.com]</dc:contributor>
    <dc:identifier opf:scheme="ISBN">9780805097122</dc:identifier>
    <dc:identifier opf:scheme="MOBI-ASIN">B00GVRVEG0</dc:identifier>
    <dc:identifier id="uuid_id" opf:scheme="uuid">da89706a-c26e-4ebc-a78b-428a3d23660f</dc:identifier>
  </metadata>
  <manifest>
    <item href="" id="cover" media-type="image/jpeg"/>
    <item href="images/00001.jpeg" id="id1" media-type="image/jpeg"/>
    <item href="images/00002.jpeg" id="id3" media-type="image/jpeg"/>
    <item href="images/00003.jpeg" id="id2" media-type="image/jpeg"/>
    <item href="images/00004.jpeg" id="id4" media-type="image/jpeg"/>
    <item href="page_styles.css" id="page_css" media-type="text/css"/>
    <item href="stylesheet.css" id="css" media-type="text/css"/>
    <item href="text/part0000.html" id="id14" media-type="application/xhtml+xml"/>
    <item href="text/part0001.html" id="id30" media-type="application/xhtml+xml"/>
    <item href="text/part0002.html" id="id10" media-type="application/xhtml+xml"/>
    <item href="text/part0003.html" id="id31" media-type="application/xhtml+xml"/>
    <item href="text/part0004.html" id="id12" media-type="application/xhtml+xml"/>
    <item href="text/part0005.html" id="id26" media-type="application/xhtml+xml"/>
    <item href="text/part0006.html" id="id27" media-type="application/xhtml+xml"/>
    <item href="text/part0007.html" id="id15" media-type="application/xhtml+xml"/>
    <item href="text/part0008.html" id="id21" media-type="application/xhtml+xml"/>
    <item href="text/part0009.html" id="id16" media-type="application/xhtml+xml"/>
    <item href="text/part0010.html" id="id29" media-type="application/xhtml+xml"/>
    <item href="text/part0011.html" id="id35" media-type="application/xhtml+xml"/>
    <item href="text/part0012.html" id="id17" media-type="application/xhtml+xml"/>
    <item href="text/part0013.html" id="id18" media-type="application/xhtml+xml"/>
    <item href="text/part0014.html" id="id33" media-type="application/xhtml+xml"/>
    <item href="text/part0015.html" id="id13" media-type="application/xhtml+xml"/>
    <item href="text/part0016.html" id="id22" media-type="application/xhtml+xml"/>
    <item href="text/part0017.html" id="id20" media-type="application/xhtml+xml"/>
    <item href="text/part0018.html" id="id11" media-type="application/xhtml+xml"/>
    <item href="text/part0019.html" id="id8" media-type="application/xhtml+xml"/>
    <item href="text/part0020.html" id="id9" media-type="application/xhtml+xml"/>
    <item href="text/part0021.html" id="id19" media-type="application/xhtml+xml"/>
    <item href="text/part0022.html" id="id7" media-type="application/xhtml+xml"/>
    <item href="text/part0023.html" id="id36" media-type="application/xhtml+xml"/>
    <item href="text/part0024.html" id="id23" media-type="application/xhtml+xml"/>
    <item href="text/part0025.html" id="id37" media-type="application/xhtml+xml"/>
    <item href="text/part0026.html" id="id34" media-type="application/xhtml+xml"/>
    <item href="text/part0027.html" id="id28" media-type="application/xhtml+xml"/>
    <item href="text/part0028.html" id="id32" media-type="application/xhtml+xml"/>
    <item href="text/part0029.html" id="id24" media-type="application/xhtml+xml"/>
    <item href="text/part0030.html" id="id25" media-type="application/xhtml+xml"/>
    <item href="titlepage.xhtml" id="titlepage" media-type="application/xhtml+xml"/>
    <item href="toc.ncx" id="ncx" media-type="application/x-dtbncx+xml"/>
  </manifest>
  <spine toc="ncx" page-progression-direction="ltr">
    <itemref idref="titlepage"/>
    <itemref idref="id14"/>
    <itemref idref="id30"/>
    <itemref idref="id10"/>
    <itemref idref="id31"/>
    <itemref idref="id12"/>
    <itemref idref="id26"/>
    <itemref idref="id27"/>
    <itemref idref="id15"/>
    <itemref idref="id21"/>
    <itemref idref="id16"/>
    <itemref idref="id29"/>
    <itemref idref="id35"/>
    <itemref idref="id17"/>
    <itemref idref="id18"/>
    <itemref idref="id33"/>
    <itemref idref="id13"/>
    <itemref idref="id22"/>
    <itemref idref="id20"/>
    <itemref idref="id11"/>
    <itemref idref="id8"/>
    <itemref idref="id9"/>
    <itemref idref="id19"/>
    <itemref idref="id7"/>
    <itemref idref="id36"/>
    <itemref idref="id23"/>
    <itemref idref="id37"/>
    <itemref idref="id34"/>
    <itemref idref="id28"/>
    <itemref idref="id32"/>
    <itemref idref="id24"/>
    <itemref idref="id25"/>
  </spine>
  <guide>
    <reference href="text/part0002.html" title="Table of Contents" type="toc"/>
    <reference href="titlepage.xhtml" title="Cover" type="cover"/>
  </guide>
</package>
`;
    }
    static async getOtherBlobs() {
        var now = new Date();
        // var res = responses.map(function(e) {return e.getContentText()});
        // .map((fetch, i) => { return fetch.getBlob().setName; });{ name: ("OEBPS/" + paths[i]), lastModified: now, input: "application/epub+zip" }
        return;
    }
}