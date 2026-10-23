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
    for name in ['TEST_REPORT.md', 'docs/PHASER_LICENSE.md', 'docs/EVENTEMITTER3_LICENSE.txt', 'docs/AUDIO_AND_ENCOUNTER.md', 'docs/UI_DESIGN_SYSTEM.md', 'docs/NUNITO_OFL.txt', 'docs/NOTO_ARABIC_OFL.txt']:
        archive.write(root / name, name)
with ZipFile(root / 'Davids_Big_Adventure_Offline.zip', 'w', ZIP_DEFLATED) as archive:
    for file in web_files:
        archive.write(file, str(file.relative_to(root / 'dist')))
    for name in ['README_FOR_TEACHER.md', 'TEST_REPORT.md', 'docs/PHASER_LICENSE.md', 'docs/EVENTEMITTER3_LICENSE.txt', 'docs/CHILD_PLAYTEST.md', 'docs/MOBILE_PWA.md', 'docs/AUDIO_AND_ENCOUNTER.md', 'docs/UI_DESIGN_SYSTEM.md', 'docs/NUNITO_OFL.txt', 'docs/NOTO_ARABIC_OFL.txt']:
        archive.write(root / name, name)
# Keep the playable download small; detailed QA evidence is a separate archive.
with ZipFile(root / 'Davids_Big_Adventure_QA.zip', 'w', ZIP_DEFLATED) as archive:
    archive.write(root / 'TEST_REPORT.md', 'TEST_REPORT.md')
    archive.write(root / 'docs/AUDIO_AND_ENCOUNTER.md', 'docs/AUDIO_AND_ENCOUNTER.md')
    archive.write(root / 'docs/UI_DESIGN_SYSTEM.md', 'docs/UI_DESIGN_SYSTEM.md')
    # Focused integrated-game evidence keeps this download below large-file limits.
    evidence_prefixes = ('10-', '11-', '12-', '13-', '26b-', '33-', '34-', '48-',
                         '49-', '51-', '55-', '56-', '57-', '58-', '59-', '61-',
                         '62-', '63-', '64-', '65-', '67-', '68-', '69-', '70-',
                         '71-', '72-', '73-', '74-', '75-', '76-', '77-', '78-', '79-',
                         '80-', '81-', '82-', '83-', '84-', '85-', '86-', '87-', '88-', '89-', '90-', '91-', '92-', '93-', '94-', '95-')
    for file in sorted((root / 'qa').rglob('*')):
        if file.is_file() and (file.suffix in ('.json', '.log') or
                              'baseline-v1' in file.parts or 'david-before' in file.parts or
                              file.name.startswith(evidence_prefixes)):
            archive.write(file, str(file.relative_to(root)))
    archive.write(root / 'docs/VISUAL_ASSETS_V1_PROGRESS.md', 'INTEGRATION_NOTES.md')
with ZipFile(root / 'Davids_Big_Adventure_Source.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['src', 'tests', 'scripts', 'docs', 'public', 'visual-assets-v1']:
        for file in sorted((root / name).rglob('*')):
            if file.is_file() and '__pycache__' not in str(file):
                archive.write(file, str(file.relative_to(root)))
    for name in ['index.html', 'package.json', 'package-lock.json', 'tsconfig.json',
                 'vite.config.ts', '.gitignore', 'README.md', 'README_FOR_TEACHER.md', 'TEST_REPORT.md']:
        archive.write(root / name, name)
with ZipFile(root / 'Davids_Big_Adventure_UI_Before_After.zip', 'w', ZIP_DEFLATED) as archive:
    for file in sorted((root / 'qa/ui-redesign').rglob('*')):
        if file.is_file():
            archive.write(file, str(file.relative_to(root / 'qa/ui-redesign')))
    for name in ['TEST_REPORT.md', 'docs/UI_DESIGN_SYSTEM.md']:
        archive.write(root / name, name)
for name in ['Davids_Big_Adventure_Web.zip', 'Davids_Big_Adventure_Offline.zip', 'Davids_Big_Adventure_Source.zip', 'Davids_Big_Adventure_QA.zip', 'Davids_Big_Adventure_UI_Before_After.zip']:
    with ZipFile(root / name) as archive:
        assert archive.testzip() is None
    print(f'{name}: {(root / name).stat().st_size:,} bytes, ZIP integrity verified')
