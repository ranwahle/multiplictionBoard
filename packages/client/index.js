import './board.js';
import './recorder.js';

//One-off sync
const activateSync = () => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then(swRegistration => {
            Notification.requestPermission();
            const board = document.querySelector('multipliction-board');
            board.addEventListener('play-success', () => {
            swRegistration.sync.register('progressSync');
            })
        });
    } else {  //  sync or serviceWorker not supported
        MultiplictionBoard.sendProgress();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const registration = await navigator.serviceWorker.register('./serviceWorker.js');
    console.log('registered', registration);
   
    activateSync(); 

    const refreshBotton = document.querySelector('button[role="button"]');
    const board = document.querySelector('multipliction-board');
    const allSuccessRecorder = document.querySelector('recording-component[data-role="all-success"]');
    const successRecorder = document.querySelector('recording-component[data-role="success"]');
    const mistakeRecorder = document.querySelector('recording-component[data-role="mistake"]');
    refreshBotton.onclick = () => {
        board.render();
    }
    board.addEventListener('play-all-success', () => {
        allSuccessRecorder.play();
    })
    board.addEventListener('play-success', () => {
        successRecorder.play();
    });
    board.addEventListener('play-mistake', () => {
        mistakeRecorder.play();
    })

    const cacheRecord = evt => {
        fetch(evt.detail).then((resp) => {
            localStorage[evt.target.attributes['storage-key'].value] =  evt.detail
            caches.open('multipliction')
                .then(cache => {
                    cache.put(evt.detail.replace('blob:', ''), resp);
                })
        });
    }
    successRecorder.addEventListener('recorded', cacheRecord);
    allSuccessRecorder.addEventListener('recorded', cacheRecord);
    mistakeRecorder.addEventListener('recorded', cacheRecord);

})
