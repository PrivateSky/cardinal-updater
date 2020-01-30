import BindableController from "./BindableController.js";
// import FormUtils from "../utils/FormValidator.js";

export default class DefaultFormController extends BindableController {
    constructor(element, model) {
        super(element);
        this.model = this.setModel(model);
        this.__initDefaultFormListeners.call(this);

        document.dispatchEvent(new CustomEvent('modelReady', {
            bubbles: true,
            cancelable: true,
            composed: true
        }));
    }

    __initDefaultFormListeners() {
        this._element.addEventListener('submit', (event) => {
            console.log('{FormController.js} Form is listening for -=submit=-');
            event.preventDefault();
            event.stopImmediatePropagation();

            // let formUtils = new FormUtils(this.model);
            // formUtils.createFormData();

            // ,
            // {
            //     "name": "Forms",
            //     "children": [{
            //         "name": "using forms"
            //     }]
            // }

            // console.log(`The form is ${formUtils.isValidForm() ? 'valid' : 'invalid'}`);
            // console.log('[Submit handler] -- model --');
            // console.log(this.model);
            // console.log('[Submit handler] -- model --');
            // console.log('[Submit handler] -- formData --');
            // console.log(formUtils.getFormData());
            // console.log('[Submit handler] -- formData --');
        }, true);

        this._element.addEventListener('reset', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            console.log('{FormController.js} Form is listening for -=reset=-');
        }, true);
    }
}