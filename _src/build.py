#!/usr/bin/env python3
"""Assemble chapter pages from the shared page template and a content file.

  python3 _src/build.py 2ht-chapter-4      build one page
  python3 _src/build.py --nav 2ht          rewrite the chapter menu on every page of a class

A page = shared head/styles + core engine + chapter content (_src/<slug>.js) + shared interface.
The shared parts are taken from TEMPLATE (a page that already uses the newer engine).
The content file is the BODY of a function (NX, P): it defines generators G / XG and ends with
    return { key, SECTIONS, LESSONS: [], G, XG, defaultMode: 'para', GOALS };
"""
import json, os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE = os.path.join(ROOT, '2ht-chapter-2', 'index.html')
PAGES = json.load(open(os.path.join(ROOT, '_src', 'pages.json'), encoding='utf-8'))


def split_template(html):
    scripts = [m for m in re.finditer(r'<script>.*?</script>', html, re.S)]
    assert len(scripts) == 3, 'template must have 3 inline scripts'
    return html[:scripts[0].start()], scripts[0].group(0), scripts[2].group(0), html[scripts[2].end():]


def nav_html(cls, current_n):
    chapters = sorted(int(re.search(r'chapter-(\d+)$', p).group(1)) for p in PAGES if PAGES[p]['cls'] == cls)
    a = ['<a class="nb" href="../">Home</a>']
    for n in chapters:
        if n == current_n:
            a.append('<a class="nb cur" href="../%s-chapter-%d/" aria-current="page">Chapter %d</a>' % (cls.lower(), n, n))
        else:
            a.append('<a class="nb" href="../%s-chapter-%d/">Chapter %d</a>' % (cls.lower(), n, n))
    return '<div class="topnav" role="navigation" aria-label="Site navigation">' + ''.join(a) + '</div>'


def set_nav(html, cls, n):
    return re.sub(r'<div class="topnav".*?</div>', lambda m: nav_html(cls, n), html, count=1, flags=re.S)


def build(slug):
    meta = PAGES[slug]
    head, s1, s3, tail = split_template(open(TEMPLATE, encoding='utf-8').read())
    n = int(re.search(r'chapter-(\d+)$', slug).group(1))
    content = open(os.path.join(ROOT, '_src', slug + '.js'), encoding='utf-8').read()
    head = re.sub(r'<title>.*?</title>', '<title>%s Chapter %d %s - practice</title>' % (meta['cls'], n, meta['title']), head, count=1)
    head = re.sub(r'<h1>.*?</h1>', '<h1>%s · Chapter %d · %s</h1>' % (meta['cls'], n, meta['title']), head, count=1)
    head = set_nav(head, meta['cls'], n)
    s2 = ('<script>\n/* %s Chapter %d: %s. %s */\n'
          'const __def = (function (NX, P) {\n%s\n})(NX, %s);\n'
          'window.Ch3 = NX.engine(__def); window.Ch3.GOALS = __def.GOALS;\n</script>\n'
          % (meta['cls'], n, meta['title'].lower(), meta.get('note', ''), content, json.dumps({'cls': meta['cls']})))
    out = head + s1 + '\n' + s2 + s3 + tail
    os.makedirs(os.path.join(ROOT, slug), exist_ok=True)
    open(os.path.join(ROOT, slug, 'index.html'), 'w', encoding='utf-8').write(out)
    print('built', slug, len(out) // 1024, 'KB')


def refresh_nav(cls):
    for slug, meta in PAGES.items():
        if meta['cls'] != cls.upper():
            continue
        p = os.path.join(ROOT, slug, 'index.html')
        if not os.path.exists(p):
            continue
        n = int(re.search(r'chapter-(\d+)$', slug).group(1))
        s = open(p, encoding='utf-8').read()
        t = set_nav(s, meta['cls'], n)
        if t != s:
            open(p, 'w', encoding='utf-8').write(t); print('nav updated', slug)


if __name__ == '__main__':
    if len(sys.argv) >= 3 and sys.argv[1] == '--nav':
        refresh_nav(sys.argv[2])
    else:
        for s in sys.argv[1:]:
            build(s)
