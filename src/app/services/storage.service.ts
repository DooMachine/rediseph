import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    constructor() { }
    set(key, val) {
        localStorage.setItem(key, val);
    }

    get(key) {
        return localStorage.getItem(key);
    }
}
