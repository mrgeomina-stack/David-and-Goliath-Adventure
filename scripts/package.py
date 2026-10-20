"""Package the tested offline build and editable project without dependency caches."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
required = ['dist/index.html', 'README_FOR_TEACHER.md', 'TEST_REPORT.md']
for name in required:
    if not (root / name).is_file():
        raise SystemExit(f'Missing deliverable: {name}')
with ZipFile(root / 'Davids_Big_Adventure_Offline.zip', 'w', ZIP_DEFLATED) as archive:
    archive.write(root / 'dist/index.html', 'index.html')
    for name in ['README_FOR_TEACHER.md', 'TEST_REPORT.md', 'docs/PHASER_LICENSE.md', 'docs/EVENTEMITTER3_LICENSE.txt', 'docs/CHILD_PLAYTEST.md']:
        archive.write(root / name, name)
# Keep the playable download small; detailed QA evidence is a separate archive.
with ZipFile(root / 'Davids_Big_Adventure_QA.zip', 'w', ZIP_DEFLATED) as archive:
    archive.write(root / 'TEST_REPORT.md', 'TEST_REPORT.md')
    for file in sorted((root / 'qa').glob('*')):
        if file.is_file():
            archive.write(file, str(file.relative_to(root)))
with ZipFile(root / 'Davids_Big_Adventure_Source.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['src', 'tests', 'scripts', 'docs']:
        for file in sorted((root / name).rglob('*')):
            if file.is_file() and '__pycache__' not in str(file):
                archive.write(file, str(file.relative_to(root)))
    for name in ['index.html', 'package.json', 'package-lock.json', 'tsconfig.json',
                 'vite.config.ts', '.gitignore', 'README.md', 'README_FOR_TEACHER.md', 'TEST_REPORT.md']:
        archive.write(root / name, name)
for name in ['Davids_Big_Adventure_Offline.zip', 'Davids_Big_Adventure_Source.zip', 'Davids_Big_Adventure_QA.zip']:
    with ZipFile(root / name) as archive:
        assert archive.testzip() is None
    print(f'{name}: {(root / name).stat().st_size:,} bytes, ZIP integrity verified')
