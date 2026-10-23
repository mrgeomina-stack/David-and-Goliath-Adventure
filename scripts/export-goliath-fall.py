"""Export evidence from real Playwright game recordings; never renders replacement gameplay."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, subprocess

root = Path(__file__).resolve().parent.parent
out = root / 'qa/goliath-fall'
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 23)
# First forehead-hit flash in the recorded 25fps streams (verified frame by frame).
records = {label: json.loads((out / label / 'recording/result.json').read_text()) for label in ['before','after']}
hits = {}
for label, info in records.items():
    video = out / label / 'recording' / Path(info['video']).name
    duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(video)],text=True))
    frames=info['frames'];elapsed=(frames[-1]['now']-frames[0]['now'])/1000
    start=max(0,duration-elapsed-2.0)
    raw=subprocess.check_output(['ffmpeg','-v','error','-ss',str(start),'-i',str(video),'-t','3.0','-vf','fps=25,crop=45:45:978:237,format=rgb24','-f','rawvideo','-'])
    size=45*45*3; scores=[]
    for i in range(len(raw)//size):
        a=raw[i*size:(i+1)*size]
        scores.append(sum(1 for k in range(0,len(a),3) if a[k]>236 and a[k+1]>210 and a[k+2]>150))
    flashes=[i for i in range(1,len(scores)) if scores[i]>350 and scores[i]-scores[i-1]>100]
    assert flashes, (label,scores)
    hits[label]=start+flashes[0]/25
    print(label,'first actual forehead flash',hits[label])
def source_video(label):
    return out / label / 'recording' / Path(records[label]['video']).name

def ff(args):
    subprocess.run(['ffmpeg','-y','-v','error',*map(str,args)], check=True)
for label, hit in hits.items():
    video = source_video(label)
    ff(['-ss',hit-.30,'-i',video,'-t','3.1','-vf','fps=25','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-an','-movflags','+faststart',out/f'{label}.mp4'])
    ff(['-i',out/f'{label}.mp4','-vf','fps=20,crop=620:450:620:170,scale=700:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0',out/f'{label}.gif'])
ff(['-i',out/'before.mp4','-i',out/'after.mp4','-filter_complex',
    "[0:v]crop=620:450:620:170,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='BEFORE - backward / face-up':x=12:y=12:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.7[b];[1:v]crop=620:450:620:170,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='AFTER - forward / face-down':x=12:y=12:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.7[a];[b][a]hstack[v]",
    '-map','[v]','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-an','-movflags','+faststart',out/'comparison.mp4'])
ff(['-i',out/'comparison.mp4','-vf','fps=20,scale=1240:-1,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0',out/'comparison.gif'])
shots = [(.05,'Hit'),(.18,'Shock'),(.52,'Dizzy'),(1.10,'Lean forward'),(1.24,'Stumble'),(1.36,'Forward fall'),(1.50,'Face-first descent'),(1.85,'Face-down hold')]
sheet=Image.new('RGB',(1984,780),'#173b3d');draw=ImageDraw.Draw(sheet)
for i,(at,title) in enumerate(shots):
    frame=out/f'sequence-{i:02}.png'
    timing=records['after']['frames']
    observed=min(timing,key=lambda f:abs(f['t']-at))
    when=hits['after']+(observed['now']-timing[0]['now'])/1000
    ff(['-ss',when,'-i',source_video('after'),'-frames:v','1',frame])
    im=Image.open(frame).convert('RGB').crop((620,170,1240,620)).resize((496,360),Image.Resampling.LANCZOS)
    x=i%4*496;y=i//4*390
    sheet.paste(im,(x,y+30));draw.text((x+10,y+3),title,font=font,fill='#fff4cf')
    frame.unlink()
sheet.save(out/'sequence.png')
comparison=Image.new('RGB',(1920,580),'#173b3d');draw=ImageDraw.Draw(comparison)
for i,label in enumerate(['before','after']):
    frame=out/f'final-{label}.png'
    ff(['-ss',hits[label]+2,'-i',source_video(label),'-frames:v','1',frame])
    im=Image.open(frame).convert('RGB').resize((960,540),Image.Resampling.LANCZOS)
    comparison.paste(im,(i*960,40));draw.text((i*960+15,7),label.upper()+' - actual in-game resting pose',font=font,fill='#fff4cf')
comparison.save(out/'resting-before-after.png')
(out/'clip-timing.json').write_text(json.dumps({'source':'Actual offline game browser recordings; no game state mutation','firstHitVideoSeconds':hits,'leadInSeconds':.3,'clipSeconds':3.1,'sequenceSampleSecondsAfterHit':[t for t,_ in shots],'silentVideo':True},indent=2)+'\n')
print('Exported actual-game GIF/MP4 comparisons, sequence sheet and resting-pose screenshots.')
