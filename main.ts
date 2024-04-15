import { YouTube } from 'pytube';
import * as os from 'os';
import * as pyperclip from 'pyperclip';
import * as re from 'regex';
import * as json from 'json';

class Downloader {
    video: YouTube;
    streams: YouTube['streams'];
    path: string;
    title: string;
    description: string;
    thumb: string;

    constructor(video: string, path: string = './') {
        this.video = new YouTube(video);
        this.streams = this.video.streams;
        this.path = path;
        this.title = this.video.title;
        this.description = this.video.description;
        this.thumb = this.video.thumbnail_url;
    }

    getMax(): void {
        const yt = this.streams.getHighestResolution();
        yt.download(this.path);
    }

    getLowest(): void {
        const yt = this.streams.getLowestResolution();
        yt.download(this.path);
    }

    getAudio(): void {
        const yt = this.streams.filter({ only_audio: true }).first();
        const vid = yt.download(this.path);
        const [base, ext] = os.path.splitext(vid);
        const newFile = `${base}.mp3`;
        os.rename(vid, newFile);
    }
}

function checkPaths(paths: string[]): string[] {
    const ex: string[] = [];
    for (let p = 0; p < paths.length; p++) {
        if (os.path.exists(paths[p])) {
            ex.push(paths[p]);
        }
    }
    return ex;
}

function showOptions(options: string[]): void {
    for (let opt = 0; opt < options.length; opt++) {
        console.log(`    ${opt} | ${options[opt]}`);
    }
}

function main(): void {
    // getting video
    const video = (input("Link of the video (blank = get from clipboard): ") || pyperclip.paste()) as string;
    console.log(`Url: ${video}`);
    assert(re.search(r'http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?', video), 'Invalid URL');

    // getting quality
    const options = ['MP3 Audio', 'Lowest Quality', 'Max Quality'];
    console.log('OPTIONS:');
    showOptions(options);
    const option = Object.getOwnPropertyNames(Downloader.prototype).slice(-3)[parseInt(input('Choose the option: '))];

    // getting path
    try {
        const data = JSON.parse(await fs.readFile('paths.json', 'utf8'));
        const paths = checkPaths(data.paths);
        console.log('PATHS: ');
        showOptions(paths);
    } catch (err) {
        console.error('Error while reading paths.json');
    }
    const path = (input('Choose a custom or existing paths(blank = ./):') || './') as string;
    let d: Downloader;
    if (!isNaN(parseInt(path)) && parseInt(path) <= paths.length) {
        d = new Downloader(video, paths[parseInt(path)]);
    } else {
        d = new Downloader(video, path);
    }
    console.log(`Downloading ${d.title}...`);
    (d as any)[option]();
    console.log('Video Downloaded!');
}

if (require.main === module) {
    main();
}
