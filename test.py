from PIL import Image
from subprocess import Popen, PIPE

fps, duration = 24, 100
p = Popen(['ffmpeg', '-y', '-vcodec', 'png', '-r', str(fps), '-i', 'pipe:0', '-vcodec', 'mpeg4', '-qscale', '5', '-r', str(fps), '-f', 'image2pipe', 'data/video.mp4'], stdin=PIPE)
for i in range(fps * duration):
    im = Image.new("RGB", (300, 300), (i, 1, 1))
    im.save(p.stdin, 'PNG')
p.stdin.close()
p.wait()