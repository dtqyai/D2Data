#!/usr/bin/env python3
"""Local static preview. Data preparation is handled by separate tools."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit, unquote
import argparse, json, re, sys, webbrowser

ROOT=Path(__file__).resolve().parent
PAGE_ROUTE=re.compile(r'^/d2r/data/(runeword|unique|set|normal|cube|craft|affix|skill|rune)$')

class Handler(SimpleHTTPRequestHandler):
    extensions_map={**SimpleHTTPRequestHandler.extensions_map,'.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.d2r':'application/octet-stream'}
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT/'dist'),**kwargs)
    def do_GET(self):
        path=urlsplit(self.path).path
        route=path.rstrip('/') or '/'
        if route in ('/','/index.html','/d4/boss-timer','/wiki') or PAGE_ROUTE.fullmatch(route):
            self.path='/index.html'
        elif path.startswith('/items/') and not (ROOT/'dist'/unquote(path).lstrip('/')).is_file():
            missing=ROOT/'dist/missing-images.json'
            known={x['path'] for x in json.loads(missing.read_text())} if missing.exists() else set()
            if unquote(path).lstrip('/') in known:self.path='/missing.svg'
        return super().do_GET()
    def end_headers(self):
        self.send_header('Cache-Control','no-cache');self.send_header('X-Content-Type-Options','nosniff');super().end_headers()
    def list_directory(self,path):return self.send_error(404)
    def log_message(self,fmt,*args):
        if len(args)>1 and str(args[1]) not in ('200','304'):super().log_message(fmt,*args)

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--port',type=int,default=8765);parser.add_argument('--no-browser',action='store_true');args=parser.parse_args()
    if not (ROOT/'dist/manifest.json').exists():print('尚未准备数据。请先运行：python3 tools/sync.py');sys.exit(1)
    try:server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
    except OSError as exc:print(f'无法启动本地服务：{exc}');sys.exit(1)
    url=f'http://127.0.0.1:{args.port}';print(f'本地站点：{url}',flush=True)
    if not args.no_browser:webbrowser.open(url)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close()
