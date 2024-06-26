import { FileHandler } from './FileHandler';

export class Brand {
    private _name: string;
    private _image: FileHandler;

    constructor(name, logo) {
        this._name = name;
        this._image = logo;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get image(): FileHandler {
        return this._image;
    }

    set image(value: FileHandler) {
        this._image = value;
    }
}
