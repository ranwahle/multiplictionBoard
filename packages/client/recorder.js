export class RecordingComponent extends HTMLElement {

    constructor() {
        super();
        this.playerQueue = [];
    }

    connectedCallback() {
        this.render();
        this.setEvents();
        this.setPlayerSource();
    }

    setPlayerSource() {
        const storageKey = this.attributes['storage-key'];
        if (!storageKey) {
            console.error('No storage key');
            return;
        }
        const url = localStorage[storageKey.value];
        if (url) {
            this.player.src = url;
        }
    }
    enqueue() {
        this.playerQueue.push('');
    }

    get player() {
        return this.querySelector('audio');
    }

    get microphone() {
        return this.querySelector('i');
    }

    async startRecording() {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: false});

        const options = {mimeType: 'audio/webm'};

        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorder.start();
        return mediaRecorder;
    }

    playerQueue;

    play() {
        this.enqueue();
        const promises =  this.playerQueue.map(() => this.player.play());
        Promise.all(promises).then(() => this.playerQueue = []);

    }

    async setEvents() {
        let recording = false;
        let mediaRecorder;
        const microphoneButton = this.microphone;
        this.microphone.onclick =  microphoneButton.ontouchstart = microphoneButton.ontouchend =  async () => {
            const permissionStatus = navigator.permissions && navigator.permissions.request ?
                (await navigator.permissions.request({name: 'microphone'})) : {state: 'granted'};
            if (permissionStatus.state !== 'granted') {
                return;
            }
            this.player.classList.toggle('recording')
            this.microphone.classList.toggle('fa-microphone');
            this.microphone.classList.toggle('fa-microphone-slash');
            const recordedChunks = [];

            if (!recording) {
                mediaRecorder = await this.startRecording();

                recording = true;
            } else {
                mediaRecorder.stop();
                recording = false;
            }

            mediaRecorder.addEventListener('dataavailable', function(e) {
                if (e.data.size > 0) {
                    recordedChunks.push(e.data);
                }

            });

            mediaRecorder.addEventListener('stop', () => {

               const audioUrl = URL.createObjectURL(new Blob(recordedChunks, {type: "audio/webm"}));
                this.player.src = audioUrl;
                this.dispatchEvent(new CustomEvent('recorded', {detail: audioUrl}));

            });

        }


    }

    render() {
        this.innerHTML = `<button> <i class="fas fa-microphone" style="font-size: 2em;"></i></button>
                                            
                <audio controls id="recorder" type="audio/webm"></audio>`
         ;
        this.style.display = 'flex';

    }
}

customElements.define('recording-component', RecordingComponent );
