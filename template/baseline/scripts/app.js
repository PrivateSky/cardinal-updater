import DefaultApplicationController from "./controllers/DefaultApplicationController.js";
import TestFormController from "./controllers/test-controllers/TestFormController.js";
import TestFormForEachController from "./controllers/test-controllers/TestFormForEachController.js";
import TestFormChildrenController from './controllers/test-controllers/TestFormChildrenController.js';
import ApplicationController from "./controllers/ApplicationController.js";
import DefaultFormController from "./controllers/DefaultFormController.js";

document.addEventListener("controllerFactoryIsReady", (e) => {
    let ControllerFactory = e.detail;

    ControllerFactory.registerController("TestFormController", TestFormController);
    ControllerFactory.registerController("ApplicationController", ApplicationController);
    ControllerFactory.registerController("DefaultFormController", DefaultFormController);
    ControllerFactory.registerController("TestFormForEachController", TestFormForEachController);
    ControllerFactory.registerController("TestFormChildrenController", TestFormChildrenController);
    ControllerFactory.registerController("DefaultApplicationController", DefaultApplicationController);
});
