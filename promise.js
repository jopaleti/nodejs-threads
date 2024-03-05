/**
 * The Promise constructor takes a function with 
 * two parameters, resolve and reject, which are
 * functions provided by the Promise implementation.
 */
const myPromise = new Promise((resolve, reject) => {
    // Simulate an asynchronous operation (e.g reading a file)
    setTimeout(() => {
        const success = false;
        if (success) {
            resolve("Operation was successful!!!");
        }
        reject("Operation failed!!!");
    }, 2000);
})

myPromise.then((result) => console.log(result)).catch((error) => console.log(error))