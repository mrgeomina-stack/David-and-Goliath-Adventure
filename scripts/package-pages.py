"""Package only the prebuilt static site, with index.html at the ZIP root."""
from pathlib import Path
import json
import zipfile

root = Path('pages-dist')
report = json.loads((root / 'build-report.json').read_text())
files = sorted(p for p in root.rglob('*') if p.is_file())
assert len(files) <= 1000, 'Exceeds dashboard direct-upload file count; use Wrangler instead'
assert all(p.stat().st_size <= 25 * 1024 * 1024 for p in files), 'Cloudflare individual-file limit'
assert (root / 'index.html').exists() and (root / 'sw.js').exists()
archive = Path('Davids_Big_Adventure_Cloudflare_Pages.zip')
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for path in files:
        z.write(path, path.relative_to(root).as_posix())
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    assert 'index.html' in z.namelist()
    assert not any(p.startswith('pages-dist/') for p in z.namelist())
print(f'{archive}: {archive.stat().st_size:,} bytes; {len(files)} files; largest {report["largest"]["bytes"]:,} bytes')
