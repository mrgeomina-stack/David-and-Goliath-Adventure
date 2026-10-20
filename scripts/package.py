"""Package the tested offline build and editable project without dependency caches."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
required = ['dist/index.html', 'README_FOR_TEACHER.md', 'TEST_REPORT.md']
for name in required:
    if not (root / name).is_file():
        raise SystemExit(f'Missing deliverable: {name}')
web_files = [root / 'dist' / name for name in ['index.html', 'sw.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png']]
for file in web_files:
    if not file.is_file():
        raise SystemExit(f'Missing web asset: {file}')
with ZipFile(root / 'Davids_Big_Adventure_Web.zip', 'w', ZIP_DEFLATED) as archive:
    for file in web_files:
        archive.write(file, str(file.relative_to(root / 'dist')))
    archive.write(root / 'docs/MOBILE_PWA.md', 'MOBILE_PWA.md')
    for name in ['TEST_REPORT.md', 'docs/PHASER_LICENSE.md', 'docs/EVENTEMITTER3_LICENSE.txt']:
        archive.write(root / name, name)
with ZipFile(root / 'Davids_Big_Adventure_Offline.zip', 'w', ZIP_DEFLATED) as archive:
    for file in web_files:
        archive.write(file, str(file.relative_to(root / 'dist')))
    for name in ['README_FOR_TEACHER.md', 'TEST_REPORT.md', 'docs/PHASER_LICENSE.md', 'docs/EVENTEMITTER3_LICENSE.txt', 'docs/CHILD_PLAYTEST.md', 'docs/MOBILE_PWA.md']:
        archive.write(root / name, name)
# Keep the playable download small; detailed QA evidence is a separate archive.
with ZipFile(root / 'Davids_Big_Adventure_QA.zip', 'w', ZIP_DEFLATED) as archive:
    archive.write(root / 'TEST_REPORT.md', 'TEST_REPORT.md')
    for file in sorted((root / 'qa').glob('*')):
        if file.is_file():
            archive.write(file, str(file.relative_to(root)))
with ZipFile(root / 'Davids_Big_Adventure_Source.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['src', 'tests', 'scripts', 'docs', 'public', 'visual-assets-v1']:
        for file in sorted((root / name).rglob('*')):
            if file.is_file() and '__pycache__' not in str(file):
                archive.write(file, str(file.relative_to(root)))
    for name in ['index.html', 'package.json', 'package-lock.json', 'tsconfig.json',
                 'vite.config.ts', '.gitignore', 'README.md', 'README_FOR_TEACHER.md', 'TEST_REPORT.md']:
        archive.write(root / name, name)
for name in ['Davids_Big_Adventure_Web.zip', 'Davids_Big_Adventure_Offline.zip', 'Davids_Big_Adventure_Source.zip', 'Davids_Big_Adventure_QA.zip']:
    with ZipFile(root / name) as archive:
        assert archive.testzip() is None
    print(f'{name}: {(root / name).stat().st_size:,} bytes, ZIP integrity verified')
