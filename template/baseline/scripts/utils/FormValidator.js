export default class FormValidator {
    constructor(model) {
        this._model = model;
        this._isValidForm = true;
        this._formData = {};
    }

    isValidForm = () => {
        return this._isValidForm;
    }

    getFormData = () => {
        return this._formData;
    }

    createFormData = () => {
        if (!this._model || Object.keys(this._model).length === 0) {
            return null;
        }

        this.__parseInnerObject(this._model, '');

        return true;
    }

    __parseInnerObject = (obj, chain) => {
        Object.keys(obj).forEach(key => {
            const fullChain = chain === '' ? key : `${chain}.${key}`;
            const value = this._model.getChainValue(fullChain);

            if (Array.isArray(value)) {
                this._formData[key] = this.__parseInnerArray(value, fullChain);
                return;
            }

            if (!value.hasOwnProperty('value')) {
                this.__parseInnerObject(value, fullChain);
                return;
            }

            const propValue = value['value'] ? value['value'] : null;
            const required = value['required'] ? value['required'] : false;

            if (required && (typeof propValue === 'undefined' || propValue === null)) {
                this._model.setChainValue(`${fullChain}.invalidValue`, false);
                this.isValidForm = false;
            } else {
                this._model.setChainValue(`${fullChain}.invalidValue`, true);
                this._formData[key] = propValue;
            }
        });
    }

    __parseInnerArray = (arr, chain) => {

    }
}