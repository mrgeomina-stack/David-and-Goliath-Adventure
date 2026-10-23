"""Package the self-contained desktop game without changing historical release ZIPs."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
site_files = ['index.html', 'sw.js', 'manifest.webmanifest', 'icons/icon-192.png',
              'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png']
documents = ['TEST_REPORT.md', 'docs/PAGES_TEST_REPORT.md', 'docs/CHILD_PLAYTEST.md',
             'docs/STORY_INTERLUDES.md', 'docs/AUDIO_AND_ENCOUNTER.md', 'docs/UI_DESIGN_SYSTEM.md',
             'README_FOR_TEACHER.md', 'docs/JOYSTICK_CONTROLS.md', 'docs/MOBILE_PWA.md',
             'docs/CLOUDFLARE_PAGES_FREE.md', 'docs/PHASER_LICENSE.md',
             'docs/EVENTEMITTER3_LICENSE.txt', 'docs/NUNITO_OFL.txt', 'docs/NOTO_ARABIC_OFL.txt']
archive = root / 'Davids_Big_Adventure_Offline.zip'
for name in site_files:
    assert (root / 'dist' / name).is_file(), f'Missing built asset: {name}'
with ZipFile(archive, 'w', ZIP_DEFLATED, compresslevel=6) as z:
    for name in site_files:
        z.write(root / 'dist' / name, name)
    for name in documents:
        z.write(root / name, name)
with ZipFile(archive) as z:
    assert z.testzip() is None
    assert 'index.html' in z.namelist()
print(f'{archive.name}: {archive.stat().st_size:,} bytes, ZIP integrity verified')
