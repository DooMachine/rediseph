
const Rx = require('rxjs');
const cmdActions = require('./commandactions');


let cmdListener = new Rx.Subject();

async function subscribeToCmdListener(callback) {
    cmdListener.subscribe((actions) => {
        callback(actions);
    })
}


module.exports = { cmdListener, subscribeToCmdListener }